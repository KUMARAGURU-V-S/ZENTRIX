// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
console.log('import.meta.env:', import.meta.env);
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBdDDeepVsjx74fuLXnkKxfZ-1ER4PB20s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zentrix-d3707.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zentrix-d3707",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zentrix-d3707.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "470250095555",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:470250095555:web:586307530e5a9d7598f376",
  measurementId: "G-GWSYCLLMS4"
};

// Validate that all Firebase config values are present
const configKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
for (const key of configKeys) {
  if (firebaseConfig[key] === undefined) {
    throw new Error(
      `Firebase config is missing. Make sure you have a .env.local file with all the required VITE_FIREBASE_* variables. Missing: ${key}`
    );
  }
}

console.log('Firebase config loaded:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };