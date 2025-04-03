import { useSetAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/config";
import { setUserPresence } from "../utils/presence";

const useAuth = () => {
  const setUser = useSetAtom(userAtom);

  // Handle Firebase Auth state change (fixes online/offline status)
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUserPresence(user.uid, true); // Mark user as online
    } else {
      setUser(null);
    }
  });

  // Signup function
  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      const userData = {
        uid: user.uid,
        displayName,
        email,
        createdAt: new Date(),
        online: true,
      };

      await setDoc(doc(db, "users", user.uid), userData);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      setUserPresence(user.uid, true);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let userData = userSnap.exists() ? userSnap.data() : { uid: user.uid, email: user.email };

      // Mark user as online
      setUserPresence(user.uid, true);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        console.log("User is logging out:", user.uid);

        // Mark user as offline
        await setUserPresence(user.uid, false);
        await updateDoc(doc(db, "users", user.uid), {
          online: false,
          lastSeen: serverTimestamp(),
        });

        console.log("User status updated in Firestore");
      }

      await signOut(auth);
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return { signup, login, logout };
};

export default useAuth;
