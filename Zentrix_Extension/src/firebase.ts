// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Check if all required Firebase config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.warn('Firebase config is missing some variables:', missingKeys.join(', '));
  console.warn('Extension will run in development mode without Firebase features');
  
  // Don't throw error immediately - let the extension mount and handle missing Firebase gracefully
}

// Initialize Firebase only if configuration is valid
let app: any = null;
let auth: any = null;
let analytics: any = null;

const hasValidConfig = missingKeys.length === 0;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Analytics might not work in extension context, so handle gracefully
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Firebase Analytics not available in extension context');
    }
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    console.warn('Extension will run without Firebase features');
  }
} else {
  console.warn('Skipping Firebase initialization due to missing configuration');
}

export { app, auth, analytics };
export { hasValidConfig };
