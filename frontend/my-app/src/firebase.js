// filepath: d:\GitHub\ZENTRIX\frontend\my-app\src\firebase.js

// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // ✅ Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2x7FRB-d_jZJJkderBMZxG4zUIX0REig",
  authDomain: "zentrix-9c750.firebaseapp.com",
  projectId: "zentrix-9c750",
  storageBucket: "zentrix-9c750.firebasestorage.app",
  messagingSenderId: "167208189493",
  appId: "1:167208189493:web:6f0456d2ee94a208673b7c",
  measurementId: "G-LF8QM3D5B9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Auth + Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);   // ✅ Firestore instance
