/**
 * Lumina — Chandelier Data Migration Script
 * 
 * Migrates the Chandeliers category and its products from products.json
 * into Firebase Firestore, and uploads product images to Firebase Storage.
 * 
 * Usage:
 *   cd scripts
 *   npm install firebase
 *   node migrate-chandeliers.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Firebase Config ──────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAigaPZBTCHCETCjnnqmI531H6XPzprxaQ",
  authDomain: "lumina-website-b5035.firebaseapp.com",
  projectId: "lumina-website-b5035",
  storageBucket: "lumina-website-b5035.firebasestorage.app",
  messagingSenderId: "680162335951",
  appId: "1:680162335951:web:111545f42277680459ebba",
  measurementId: "G-GRYZQ1JJLD"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const storage = getStorage(app);

// ── Read products.json ───────────────────────────────────────────
const raw = readFileSync(join(ROOT, "products.json"), "utf-8");
const data = JSON.parse(raw);

// ── Helper: Upload an image file and return its download URL ─────
async function uploadImage(localPath, storagePath) {
  try {
    const fileBuffer = readFileSync(localPath);
    const storageRef = ref(storage, storagePath);
    
    // Determine content type
    const ext = localPath.split('.').pop().toLowerCase();
    const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    
    await uploadBytes(storageRef, fileBuffer, { contentType });
    const url = await getDownloadURL(storageRef);
    console.log(`  ✓ Uploaded: ${storagePath}`);
    return url;
  } catch (err) {
    console.error(`  ✗ Failed to upload ${localPath}:`, err.message);
    return null;
  }
}

// ── Main Migration ───────────────────────────────────────────────
async function migrate() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  Lumina — Chandelier Migration Script    ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // 1. Migrate Chandeliers category
  const chandeliersCategory = data.categories.find(c => c.id === "chandeliers");
  if (!chandeliersCategory) {
    console.error("Could not find chandeliers category in products.json!");
    process.exit(1);
  }

  console.log("── Migrating Category: Chandeliers ──");
  
  // Upload category image
  const catImgPath = join(ROOT, "images", chandeliersCategory.img);
  let catImgUrl = null;
  try {
    catImgUrl = await uploadImage(catImgPath, `categories/${chandeliersCategory.img}`);
  } catch (e) {
    console.log(`  ⚠ Category image not found at ${catImgPath}, skipping image upload.`);
  }

  await setDoc(doc(db, "categories", "chandeliers"), {
    name: chandeliersCategory.name,
    subtitle: chandeliersCategory.subtitle,
    shortDesc: chandeliersCategory.shortDesc,
    longDesc: chandeliersCategory.longDesc,
    categoryType: chandeliersCategory.categoryType,
    tag: chandeliersCategory.tag,
    img: catImgUrl || chandeliersCategory.img,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  console.log("  ✓ Category document written to Firestore\n");

  // 2. Migrate all chandelier products
  const chandelierProducts = data.products.filter(p => p.categoryId === "chandeliers");
  console.log(`── Migrating ${chandelierProducts.length} Chandelier Products ──\n`);

  for (const product of chandelierProducts) {
    console.log(`  Product: ${product.name}`);
    
    // Upload product image
    const prodImgPath = join(ROOT, "images", "chandeliers", product.img);
    let prodImgUrl = null;
    try {
      prodImgUrl = await uploadImage(prodImgPath, `products/${product.img}`);
    } catch (e) {
      console.log(`    ⚠ Product image not found at ${prodImgPath}, skipping.`);
    }

    await setDoc(doc(db, "products", product.id), {
      name: product.name,
      categoryId: product.categoryId,
      desc: product.desc,
      img: prodImgUrl || product.img,
      badge: product.badge || "",
      badgeClass: product.badgeClass || "",
      tags: product.tags || [],
      specs: product.specs || [],
      lightingVariants: ["Cool White", "Warm White"],  // Default variants for migration
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`    ✓ Written to Firestore as "${product.id}"\n`);
  }

  console.log("══════════════════════════════════════════");
  console.log(`  Migration Complete!`);
  console.log(`  • 1 category migrated`);
  console.log(`  • ${chandelierProducts.length} products migrated`);
  console.log("══════════════════════════════════════════\n");
  
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
