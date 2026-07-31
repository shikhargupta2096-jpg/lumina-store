import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
