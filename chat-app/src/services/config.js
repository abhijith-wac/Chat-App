import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // ✅ Add Realtime Database

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "react-chatapp-wac.firebaseapp.com",
  projectId: "react-chatapp-wac",
  storageBucket: "react-chatapp-wac.appspot.com",
  messagingSenderId: "613293126348",
  appId: "1:613293126348:web:d3667adb5339280c0c8869",
  databaseURL: "https://react-chatapp-wac-default-rtdb.firebaseio.com", // ✅ Add this
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app); // ✅ Export Realtime Database

export default app;
