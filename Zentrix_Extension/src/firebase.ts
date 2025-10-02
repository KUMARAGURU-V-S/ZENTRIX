import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2x7FRB-d_jZJJkderBMZxG4zUIX0REig",
  authDomain: "zentrix-9c750.firebaseapp.com",
  projectId: "zentrix-9c750",
  storageBucket: "zentrix-9c750.firebasestorage.app",
  messagingSenderId: "167208189493",
  appId: "1:167208189493:web:6f0456d2ee94a208673b7c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };