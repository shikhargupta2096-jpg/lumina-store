// Firebase Configuration for Lumina Website
// This file is used by the main website to fetch data from Firestore

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAigaPZBTCHCETCjnnqmI531H6XPzprxaQ",
  authDomain: "lumina-website-b5035.firebaseapp.com",
  projectId: "lumina-website-b5035",
  storageBucket: "lumina-website-b5035.firebasestorage.app",
  messagingSenderId: "680162335951",
  appId: "1:680162335951:web:111545f42277680459ebba",
  measurementId: "G-GRYZQ1JJLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Loads all categories and products from Firestore and returns
 * the same { categories: [], products: [] } shape that the old
 * products.json used to provide.
 */
export async function loadProductData() {
  try {
    // Fetch categories
    const catSnap = await getDocs(collection(db, "categories"));
    const categories = [];
    catSnap.forEach(doc => {
      categories.push({ ...doc.data(), id: doc.id });
    });

    // Fetch products
    const prodSnap = await getDocs(collection(db, "products"));
    const products = [];
    prodSnap.forEach(doc => {
      products.push({ ...doc.data(), id: doc.id });
    });

    return { categories, products };
  } catch (error) {
    console.error("Error loading data from Firebase:", error);
    // Fallback: try loading from products.json
    console.log("Falling back to products.json...");
    try {
      const res = await fetch('products.json?v=' + Date.now());
      return await res.json();
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return { categories: [], products: [] };
    }
  }
}

export { db };
