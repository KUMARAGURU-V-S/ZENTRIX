// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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