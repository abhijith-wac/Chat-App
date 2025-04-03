import { ref, onDisconnect, set } from "firebase/database";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { rtdb, db } from "../services/config";

// Function to update user presence
export const setUserPresence = (userId, isOnline) => {
    if (!userId) return;

    const userStatusRef = ref(rtdb, `/status/${userId}`);
    const userDocRef = doc(db, "users", userId);

    if (isOnline) {
        // User comes online
        set(userStatusRef, { online: true });
        updateDoc(userDocRef, { online: true, lastSeen: serverTimestamp() });  // Set lastSeen as server timestamp
        
        // Handle automatic disconnect updates
        onDisconnect(userStatusRef).set({ online: false }).then(() => {
            updateDoc(userDocRef, { online: false, lastSeen: serverTimestamp() });  // Use serverTimestamp() for lastSeen
        });
    } else {
        // User goes offline
        set(userStatusRef, { online: false });
        updateDoc(userDocRef, { online: false, lastSeen: serverTimestamp() });  // Ensure lastSeen is updated as timestamp
    }
};
