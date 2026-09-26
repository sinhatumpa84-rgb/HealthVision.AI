import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA8snLc2zoxPlRxp8JiAJHqyI65UTiXEj4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "healthvision-ai-e647d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "healthvision-ai-e647d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "healthvision-ai-e647d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987939443366",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987939443366:web:ce9bb020cb2ab6ae821a67",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WV82RJ8478"
};

// Initialize Firebase (singleton pattern prevents duplicate app instances)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Safe Analytics initialization (only in browser environment)
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}
