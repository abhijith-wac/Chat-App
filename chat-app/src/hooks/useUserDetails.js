import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/config";

const useUserDetails = (userId) => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setUserDetails(docSnap.exists() ? docSnap.data() : null);
    });

    return () => unsubscribe(); 
  }, [userId]);

  return userDetails;
};

export default useUserDetails;
