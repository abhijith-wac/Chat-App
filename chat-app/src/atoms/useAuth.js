import { useSetAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/config";

const useAuth = () => {
  const setUser = useSetAtom(userAtom);

  // Signup function
  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, { displayName });

      // Store user details in Firestore
      const userData = {
        uid: user.uid,
        displayName,
        email,
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), userData);

      setUser(userData); // Set userAtom with Firestore data
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

      // Fetch user data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUser(userSnap.data()); // Set userAtom with Firestore user data
      } else {
        setUser(user); // Fallback if Firestore data doesn't exist
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { signup, login };
};

export default useAuth;
