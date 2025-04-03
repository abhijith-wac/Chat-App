import { useEffect } from "react";
import { useAtom } from "jotai";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/config";
import { userDetailsAtom, userLoadingAtom } from "../atoms/chatAtom";

const useUserDetails = (userId) => {
  const [, setUserDetails] = useAtom(userDetailsAtom);
  const [, setLoading] = useAtom(userLoadingAtom);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
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
  }, [userId, setUserDetails, setLoading]);

  return null;
};

export default useUserDetails;
