// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdDDeepVsjx74fuLXnkKxfZ-1ER4PB20s",
  authDomain: "zentrix-d3707.firebaseapp.com",
  projectId: "zentrix-d3707",
  storageBucket: "zentrix-d3707.firebasestorage.app",
  messagingSenderId: "470250095555",
  appId: "1:470250095555:web:586307530e5a9d7598f376",
  measurementId: "G-GWSYCLLMS4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth, analytics };
