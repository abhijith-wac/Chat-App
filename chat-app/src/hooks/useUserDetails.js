import useSWRSubscription from "swr/subscription";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/config";

const subscribeToUserDetails = (userId, { next }) => {
  if (!userId) return;

  const docRef = doc(db, "users", userId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      next(null, docSnap.data());
    } else {
      next(null, null);
    }
  });
};

const useUserDetails = (userId) => {
  return useSWRSubscription(userId ? `user_${userId}` : null, (_, { next }) =>
    subscribeToUserDetails(userId, { next })
  );
};

export default useUserDetails;
