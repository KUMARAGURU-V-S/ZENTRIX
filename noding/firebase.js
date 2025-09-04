// firebase.js

// 1. Import necessary functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 2. Add your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ9iBbr260x1Ti4i9Q3tzm4-fQY6SumWM",
  authDomain: "zentrix-1aa38.firebaseapp.com",
  projectId: "zentrix-1aa38",
  storageBucket: "zentrix-1aa38.firebasestorage.app",
  messagingSenderId: "679639959572",
  appId: "1:679639959572:web:e8c9bf21f72a207cb37f01",
  measurementId: "G-FH60HGY6SY"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// 5. Export the 'db' object so it can be used in other files
export { db };