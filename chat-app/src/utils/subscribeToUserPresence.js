import { ref, onValue } from "firebase/database";
import { doc, onSnapshot } from "firebase/firestore";
import { rtdb, db } from "../services/config";

export const subscribeToUserPresence = (userId, callback) => {
  if (!userId) return;

  const userStatusRef = ref(rtdb, `/status/${userId}`);
  const userDocRef = doc(db, "users", userId);

  // Listen for real-time updates from RTDB
  const unsubscribeRTDB = onValue(userStatusRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val().online);
    } else {
      callback(false);
    }
  });

  // Fallback: Listen to Firestore in case RTDB doesn't update
  const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().online);
    }
  });

  return () => {
    unsubscribeRTDB();
    unsubscribeFirestore();
  };
};
