/**
 * Image optimization utilities for Lumina Admin Dashboard.
 * 
 * Handles client-side WebP conversion, resizing, and LQIP
 * (Low Quality Image Placeholder) generation before upload
 * to Supabase Storage.
 */

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 0.80;
const LQIP_WIDTH = 20;

/**
 * Loads a Blob or File into an HTMLImageElement.
 * @param {Blob} blob - The image blob to load.
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Draws an image onto a canvas at the specified dimensions
 * and returns a Blob in WebP format.
 * @param {HTMLImageElement} img
 * @param {number} width
 * @param {number} height
 * @param {number} quality - 0 to 1
 * @param {string} format - e.g. 'image/webp'
 * @returns {Promise<Blob>}
 */
function canvasToBlob(img, width, height, quality, format = 'image/webp') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  // Use high-quality downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      format,
      quality
    );
  });
}

/**
 * Generates a tiny base64-encoded LQIP (Low Quality Image Placeholder).
 * The result is a small, blurry image encoded as a data URI that can
 * be stored in Firestore alongside the full image URL.
 * 
 * @param {HTMLImageElement} img - The source image element.
 * @returns {Promise<string>} A base64 data URI of the tiny placeholder.
 */
async function generateLQIP(img) {
  const aspectRatio = img.height / img.width;
  const width = LQIP_WIDTH;
  const height = Math.round(width * aspectRatio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';
  ctx.drawImage(img, 0, 0, width, height);

  // Return as a tiny base64 data URI (typically ~200-500 bytes)
  return canvas.toDataURL('image/webp', 0.5);
}

/**
 * Optimizes an image blob for upload:
 * 1. Resizes to MAX_WIDTH if wider.
 * 2. Converts to WebP at WEBP_QUALITY.
 * 3. Generates a LQIP base64 string.
 * 
 * @param {Blob} sourceBlob - The original (cropped) image blob.
 * @returns {Promise<{ optimizedBlob: Blob, lqip: string }>}
 */
export async function optimizeImage(sourceBlob) {
  const img = await loadImage(sourceBlob);

  // Calculate target dimensions (maintain aspect ratio)
  let targetWidth = img.width;
  let targetHeight = img.height;

  if (targetWidth > MAX_WIDTH) {
    const scale = MAX_WIDTH / targetWidth;
    targetWidth = MAX_WIDTH;
    targetHeight = Math.round(img.height * scale);
  }

  // Convert to optimized WebP
  const optimizedBlob = await canvasToBlob(img, targetWidth, targetHeight, WEBP_QUALITY);

  // Generate tiny blur placeholder
  const lqip = await generateLQIP(img);

  return { optimizedBlob, lqip };
}
