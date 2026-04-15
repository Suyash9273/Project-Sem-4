import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYNuJXwZa_MAgxVng_XMoni4UN7TDYY6o",
  authDomain: "campus-ecosystem-dc09f.firebaseapp.com",
  projectId: "campus-ecosystem-dc09f",
  storageBucket: "campus-ecosystem-dc09f.firebasestorage.app",
  messagingSenderId: "799679686772",
  appId: "1:799679686772:web:cc4c342c24aa2f9b8dc921",
  measurementId: "G-VESRRXJW50"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };