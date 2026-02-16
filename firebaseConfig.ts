import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; 
import { getFirestore } from "firebase/firestore";

/**
 * Bharat Path Firebase Infrastructure
 * Used for Profile Data synchronization and Cloud Media Gallery.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDTrCtCFm3XdSzVS06X34p0JALBsJi6ZxM",
  authDomain: "bharatpath-cloud.firebaseapp.com",
  projectId: "bharatpath-cloud",
  storageBucket: "bharatpath-cloud.firebasestorage.app",
  messagingSenderId: "1083575556037",
  appId: "1:1083575556037:web:0c1eaef353c7a1cadd9dac",
  measurementId: "G-CYHZ9HEFFF"
};

// Initialize Core Application Node
const app = initializeApp(firebaseConfig);

// Fix: Removed problematic analytics initialization as it was causing a module export error and was unused.
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;