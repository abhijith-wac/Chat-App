import { ref, onDisconnect, set } from "firebase/database";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { rtdb, db } from "../services/config";

 export const setUserPresence = (userId, isOnline) => {
    if (!userId) return;

    const userStatusRef = ref(rtdb, `/status/${userId}`);
    const userDocRef = doc(db, "users", userId);

    if (isOnline) {
         set(userStatusRef, { online: true });
        updateDoc(userDocRef, { online: true, lastSeen: serverTimestamp() });  
        
         onDisconnect(userStatusRef).set({ online: false }).then(() => {
            updateDoc(userDocRef, { online: false, lastSeen: serverTimestamp() });   
        });
    } else {
         set(userStatusRef, { online: false });
        updateDoc(userDocRef, { online: false, lastSeen: serverTimestamp() });   
    }
};
