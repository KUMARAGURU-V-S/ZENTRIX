import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your real Firebase config (same project you used in frontend)
const firebaseConfig = {
  apiKey: "AIzaSyB2x7FRB-d_jZJJkderBMZxG4zUIX0REig",
  authDomain: "zentrix-9c750.firebaseapp.com",
  projectId: "zentrix-9c750",
  storageBucket: "zentrix-9c750.firebasestorage.app",
  messagingSenderId: "167208189493",
  appId: "1:167208189493:web:6f0456d2ee94a208673b7c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
