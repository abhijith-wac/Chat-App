import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/config";

const useUserDetails = (userId) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      } else {
        setUserDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { userDetails, loading };
};

export default useUserDetails;
