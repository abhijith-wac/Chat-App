import { ref, onValue, onDisconnect, set } from "firebase/database";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { rtdb, db } from "../services/config";

export const setUserPresence = (userId, isOnline) => {
  if (!userId) return;

  const userStatusRef = ref(rtdb, `/status/${userId}`);
  const userDocRef = doc(db, "users", userId);

  const onlineStatus = {
    online: true,
    lastSeen: serverTimestamp(),
  };

  const offlineStatus = {
    online: false,
    lastSeen: serverTimestamp(),
  };

  if (isOnline) {
    // Update RTDB & Firestore on login
    set(userStatusRef, onlineStatus);
    updateDoc(userDocRef, onlineStatus);

    // Handle disconnection
    onDisconnect(userStatusRef)
      .set(offlineStatus)
      .then(() => updateDoc(userDocRef, offlineStatus));

  } else {
    // Update RTDB & Firestore on logout
    set(userStatusRef, offlineStatus);
    updateDoc(userDocRef, offlineStatus);
  }
};
