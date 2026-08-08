/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: Record<string, string> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing required Firebase configuration value for: ${key}. Check your .env file.`);
  }
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== "undefined") {
  const initAnalytics = () => {
    import("firebase/analytics").then(({ isSupported, getAnalytics }) => {
      isSupported().then(supported => {
        if (supported) {
          getAnalytics(app);
        }
      });
    }).catch(() => {});
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(initAnalytics);
  } else {
    setTimeout(initAnalytics, 2000);
  }
}
