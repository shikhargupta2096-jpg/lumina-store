"""
Lumina Scene Generator — Firebase Cloud Function
=================================================
Automatically processes designer lighting product images uploaded to
Firebase Storage and generates catalogue-quality images of each light
installed and illuminated in a modern luxury interior using Hugging Face FLUX.1-dev.

Trigger: Upload images to `product_images/` in Firebase Storage.
Output:  Generated images saved to `modified_images/` in Firebase Storage.
"""

import os
import time
import logging
from datetime import datetime, timezone

from firebase_functions import storage_fn, scheduler_fn, options
from firebase_admin import initialize_app

# ──────────────────────────────────────────────
# Initialize Firebase Admin SDK (required at module level)
# ──────────────────────────────────────────────
initialize_app()

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────
STORAGE_BUCKET = "lumina-website-b5035.firebasestorage.app"
INPUT_FOLDER = "product_images/"
OUTPUT_FOLDER = "modified_images/"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
HF_MODEL = "black-forest-labs/FLUX.1-dev"
RETRY_COLLECTION = "retry_queue"
MAX_RETRIES = 5
MAX_BACKOFF_SECONDS = 480  # 8 minutes (keep under 9-min timeout)

# ──────────────────────────────────────────────
# Logging setup
# ──────────────────────────────────────────────
logger = logging.getLogger("lumina_scene_generator")
logger.setLevel(logging.INFO)


def _build_scene_prompt(filename: str) -> str:
    """Builds an editorial architectural photography prompt based on product filename hints."""
    fn_lower = filename.lower()
    if "ch" in fn_lower or "chand" in fn_lower or "pendant" in fn_lower or "ring" in fn_lower:
        fixture = "modern designer crystal and brushed brass circular LED chandelier lighting fixture hanging from a tall architectural ceiling"
    elif "lamp" in fn_lower or "table" in fn_lower:
        fixture = "designer luxury architectural table lamp glowing on a polished marble side table"
    elif "sconce" in fn_lower or "wall" in fn_lower or "wl" in fn_lower:
        fixture = "modern luxury brushed gold architectural wall sconce light mounted on a textured Venetian plaster wall"
    else:
        fixture = f"designer modern luxury lighting fixture (catalogue model {os.path.splitext(filename)[0]}) with warm ambient LED glow and premium brass architectural details"

    return (
        f"Professional architectural catalogue photography of a {fixture}, "
        "turned ON and glowing warmly as the primary centerpiece inside a high-end modern luxury interior showroom with minimalist warm neutral walls, "
        "polished marble floors, soft architectural shadow lighting, 8k resolution, editorial design photography, perfect composition, depth of field"
    )


def _get_output_filename(original_name: str) -> str:
    """Convert original filename to output filename (always .png)."""
    stem = os.path.splitext(original_name)[0]
    return f"{stem}.png"


def _is_supported_image(filename: str) -> bool:
    """Check if the file has a supported image extension."""
    ext = os.path.splitext(filename.lower())[1]
    return ext in SUPPORTED_EXTENSIONS


def _process_single_image(
    bucket, file_path: str, file_name: str
) -> tuple:
    """
    Process a single product image through Hugging Face FLUX.1-dev.

    Returns:
        Tuple of (success: bool, message: str)
    """
    # Lazy imports — only load heavy packages when actually processing
    import io
    from PIL import Image
    from huggingface_hub import InferenceClient

    start_time = time.time()
    output_name = _get_output_filename(file_name)
    output_path = f"{OUTPUT_FOLDER}{output_name}"

    # ── Check if already processed ──
    output_blob = bucket.blob(output_path)
    if output_blob.exists():
        msg = f"Skipped '{file_name}' — already processed ('{output_name}' exists)"
        logger.info(msg)
        return True, msg

    # ── Download original image ──
    logger.info(f"Downloading '{file_name}' from Storage...")
    input_blob = bucket.blob(file_path)
    image_bytes = input_blob.download_as_bytes()

    # Load with Pillow to validate image exists and read dimensions
    try:
        original_image = Image.open(io.BytesIO(image_bytes))
        logger.info(f"Image validated: {original_image.size[0]}x{original_image.size[1]}, mode={original_image.mode}")
    except Exception as e:
        msg = f"Failed to open image '{file_name}': {e}"
        logger.error(msg)
        return False, msg

    # ── Send to Hugging Face FLUX.1-dev for scene generation ──
    logger.info(f"Generating scene for '{file_name}' using Hugging Face FLUX.1-dev...")
    
    hf_token = os.environ.get("HF_API_TOKEN")
    if not hf_token:
        msg = "HF_API_TOKEN environment variable is not set in .env"
        logger.error(msg)
        return False, msg

    client = InferenceClient(model=HF_MODEL, token=hf_token)
    prompt = _build_scene_prompt(file_name)

    backoff = 20
    total_wait = 0
    last_error = None
    generated_image = None

    while total_wait < MAX_BACKOFF_SECONDS:
        try:
            generated_image = client.text_to_image(prompt)
            break
        except Exception as e:
            error_str = str(e).lower()
            last_error = str(e)
            if "rate" in error_str or "limit" in error_str or "503" in error_str or "loading" in error_str or "timeout" in error_str:
                logger.warning(
                    f"HF Serverless queue/limit on '{file_name}'. Waiting {backoff}s before retry... (total waited: {total_wait}s)"
                )
                time.sleep(backoff)
                total_wait += backoff
                backoff = min(backoff * 2, 120)
                continue
            else:
                msg = f"HF API error for '{file_name}': {e}"
                logger.error(msg)
                return False, msg

    if generated_image is None:
        msg = (
            f"Timeout waiting for Hugging Face on '{file_name}' after {total_wait}s. "
            f"Last error: {last_error}. Queuing for retry."
        )
        logger.warning(msg)
        return False, msg

    # ── Save generated image as PNG ──
    logger.info(f"Saving generated image as '{output_name}'...")
    img_buffer = io.BytesIO()
    generated_image.save(img_buffer, format="PNG", optimize=True)
    img_buffer.seek(0)
    img_bytes = img_buffer.getvalue()

    # Upload to Firebase Storage
    output_blob = bucket.blob(output_path)
    output_blob.upload_from_string(
        img_bytes, content_type="image/png"
    )

    elapsed = time.time() - start_time
    size_mb = len(img_bytes) / (1024 * 1024)
    msg = (
        f"SUCCESS: '{file_name}' -> '{output_name}' "
        f"({generated_image.size[0]}x{generated_image.size[1]}, "
        f"{size_mb:.1f} MB, {elapsed:.1f}s)"
    )
    logger.info(msg)
    return True, msg


def _add_to_retry_queue(file_path: str, file_name: str, error: str):
    """Add a failed image to the Firestore retry queue."""
    from firebase_admin import firestore

    db = firestore.client()
    doc_id = os.path.splitext(file_name)[0]  # Use filename stem as doc ID
    now = datetime.now(timezone.utc).isoformat()

    doc_ref = db.collection(RETRY_COLLECTION).document(doc_id)
    doc = doc_ref.get()

    if doc.exists:
        # Update existing entry
        data = doc.to_dict()
        doc_ref.update(
            {
                "status": "pending",
                "error": error,
                "retry_count": data.get("retry_count", 0) + 1,
                "updated_at": now,
            }
        )
    else:
        # Create new entry
        doc_ref.set(
            {
                "file_path": file_path,
                "original_name": file_name,
                "status": "pending",
                "error": error,
                "retry_count": 0,
                "created_at": now,
                "updated_at": now,
            }
        )
    logger.info(f"Added '{file_name}' to retry queue")


def _remove_from_retry_queue(file_name: str):
    """Remove a successfully processed image from the retry queue."""
    from firebase_admin import firestore

    db = firestore.client()
    doc_id = os.path.splitext(file_name)[0]
    doc_ref = db.collection(RETRY_COLLECTION).document(doc_id)
    if doc_ref.get().exists:
        doc_ref.delete()
        logger.info(f"Removed '{file_name}' from retry queue")


# ═══════════════════════════════════════════════
# FUNCTION 1: Storage Trigger — Process on Upload
# ═══════════════════════════════════════════════
# @storage_fn.on_object_finalized(
#     timeout_sec=540,
#     memory=options.MemoryOption.GB_2,
#     region="us-east1",
#     max_instances=3,
# )
# def process_product_image(event: storage_fn.CloudEvent):
#     """
#     Triggered when a file is uploaded to Firebase Storage.
#     Processes images in the `product_images/` folder.
#     """
#     from firebase_admin import storage as admin_storage
# 
#     file_path = event.data.name  # e.g., "product_images/chandelier.jpg"
#     file_name = os.path.basename(file_path)
# 
#     # ── Guard: Only process files in the input folder ──
#     if not file_path.startswith(INPUT_FOLDER):
#         return
# 
#     # ── Guard: Only process supported image types ──
#     if not _is_supported_image(file_name):
#         logger.info(f"Skipping non-image file: '{file_name}'")
#         return
# 
#     # ── Guard: Ignore hidden/temp files ──
#     if file_name.startswith(".") or file_name.startswith("_"):
#         return
# 
#     logger.info(f"{'='*50}")
#     logger.info(f"PROCESSING: {file_name}")
#     logger.info(f"{'='*50}")
# 
#     # Get the Storage bucket
#     bucket = admin_storage.bucket(STORAGE_BUCKET)
# 
#     # Process the image
#     success, message = _process_single_image(bucket, file_path, file_name)
# 
#     if not success:
#         # Add to retry queue for later processing
#         _add_to_retry_queue(file_path, file_name, message)
#     else:
#         # In case it was in the retry queue from before, remove it
#         _remove_from_retry_queue(file_name)
# 
#     logger.info(f"{'='*50}")
#     logger.info(f"Result: {message}")
#     logger.info(f"{'='*50}")
# 
# 
# ═══════════════════════════════════════════════
# FUNCTION 2: Scheduled — Retry Failed Images
# ═══════════════════════════════════════════════
# @scheduler_fn.on_schedule(
#     schedule="every 15 minutes",
#     timeout_sec=540,
#     memory=options.MemoryOption.GB_2,
#     region="us-east1",
# )
# def retry_failed_images(event: scheduler_fn.ScheduledEvent):
#     """
#     Runs every 15 minutes to retry failed images from the retry queue.
#     Processes up to 5 images per run to stay within rate limits.
#     """
#     from firebase_admin import firestore, storage as admin_storage
# 
#     db = firestore.client()
#     bucket = admin_storage.bucket(STORAGE_BUCKET)
# 
#     # Query pending retry items
#     query = (
#         db.collection(RETRY_COLLECTION)
#         .where("status", "==", "pending")
#         .limit(5)
#     )
#     docs = query.get()
# 
#     if not docs:
#         logger.info("Retry queue is empty — nothing to do")
#         return
# 
#     logger.info(f"{'='*50}")
#     logger.info(f"RETRY RUN: {len(docs)} images to retry")
#     logger.info(f"{'='*50}")
# 
#     processed = 0
#     failed = 0
# 
#     for doc in docs:
#         data = doc.to_dict()
#         file_path = data["file_path"]
#         file_name = data["original_name"]
#         retry_count = data.get("retry_count", 0)
# 
#         # Check if max retries exceeded
#         if retry_count >= MAX_RETRIES:
#             logger.warning(
#                 f"'{file_name}' has failed {retry_count} times. "
#                 f"Marking as permanently failed."
#             )
#             doc.reference.update(
#                 {
#                     "status": "failed_permanent",
#                     "updated_at": datetime.now(timezone.utc).isoformat(),
#                 }
#             )
#             failed += 1
#             continue
# 
#         logger.info(
#             f"Retrying '{file_name}' (attempt {retry_count + 1}/{MAX_RETRIES})"
#         )
# 
#         # Check if the source file still exists
#         source_blob = bucket.blob(file_path)
#         if not source_blob.exists():
#             logger.warning(
#                 f"Source file '{file_path}' no longer exists. "
#                 f"Removing from retry queue."
#             )
#             doc.reference.delete()
#             continue
# 
#         # Retry processing
#         success, message = _process_single_image(
#             bucket, file_path, file_name
#         )
# 
#         now = datetime.now(timezone.utc).isoformat()
# 
#         if success:
#             # Remove from retry queue on success
#             doc.reference.delete()
#             processed += 1
#             logger.info(f"Retry successful: {message}")
#         else:
#             # Update retry count
#             doc.reference.update(
#                 {
#                     "error": message,
#                     "retry_count": retry_count + 1,
#                     "updated_at": now,
#                 }
#             )
#             failed += 1
#             logger.warning(f"Retry failed: {message}")
# 
#         # Small delay between retries to avoid rate limits
#         time.sleep(5)
# 
#     logger.info(f"{'='*50}")
#     logger.info(
#         f"Retry run complete: {processed} succeeded, {failed} failed"
#     )
#     logger.info(f"{'='*50}")
