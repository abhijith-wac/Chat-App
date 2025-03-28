import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "react-chatapp-wac.firebaseapp.com",
  projectId: "react-chatapp-wac",
  storageBucket: "react-chatapp-wac.appspot.com",
  messagingSenderId: "613293126348",
  appId: "1:613293126348:web:d3667adb5339280c0c8869"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;