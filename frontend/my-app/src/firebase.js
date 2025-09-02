// filepath: d:\GitHub\ZENTRIX\frontend\my-app\src\firebase.js

// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // ✅ Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ9iBbr260x1Ti4i9Q3tzm4-fQY6SumWM",
  authDomain: "zentrix-1aa38.firebaseapp.com",
  projectId: "zentrix-1aa38",
  storageBucket: "zentrix-1aa38.firebasestorage.app",
  messagingSenderId: "679639959572",
  appId: "1:679639959572:web:e8c9bf21f72a207cb37f01",
  measurementId: "G-FH60HGY6SY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Auth + Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);   // ✅ Firestore instance
