import useSWR from "swr";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/config";

// Firestore fetcher function
const fetchUserDetails = async (userId) => {
  if (!userId) return null;
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

const useUserDetails = (userId) => {
  return useSWR(userId ? `user_${userId}` : null, () => fetchUserDetails(userId));
};

export default useUserDetails;
