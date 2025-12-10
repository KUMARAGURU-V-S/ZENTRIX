// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug logging to verify environment variables are loaded correctly
console.log('Firebase API Key from env:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('All Firebase config:', firebaseConfig);

// Check if all required Firebase config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.warn('Firebase config is missing some variables:', missingKeys.join(', '));
  console.warn('App will run in development mode without Firebase features');
  
  // Don't throw error immediately - let the app mount and handle missing Firebase gracefully
}

// Initialize Firebase only if configuration is valid
let app: any = null;
let db: any = null;
let auth: any = null;

const hasValidConfig = missingKeys.length === 0;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    console.warn('App will run without Firebase features');
  }
} else {
  console.warn('Skipping Firebase initialization due to missing configuration');
}

export { db, auth, app };
export { hasValidConfig };