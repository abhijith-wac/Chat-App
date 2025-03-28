import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "react-chatapp-wac.firebaseapp.com",
  projectId: "react-chatapp-wac",
  messagingSenderId: "613293126348",
  appId: "1:613293126348:web:d3667adb5339280c0c8869"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);