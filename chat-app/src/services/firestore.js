import { db } from './config';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    onSnapshot 
} from "firebase/firestore";

export function getChatRoomId(user1Id, user2Id) {
    return [user1Id, user2Id].sort().join('_');
}

export async function sendPrivateMessage(senderId, receiverId, messageText) {
    try {
        const chatRoomId = getChatRoomId(senderId, receiverId);
        const messagesRef = collection(db, `private_chats/${chatRoomId}/messages`);
        
        const messageData = {
            senderId,
            receiverId,
            text: messageText,
            timestamp: serverTimestamp(),
            time: new Date().toLocaleTimeString(),
            isRead: false
        };
        
        const docRef = await addDoc(messagesRef, messageData);
        return docRef.id;
    } catch (error) {
        console.error("Error sending message: ", error);    }
}

export const fetchMessages = (user1Id, user2Id) => {
    return new Promise((resolve) => {
        const chatRoomId = getChatRoomId(user1Id, user2Id);
        const messagesRef = collection(db, `private_chats/${chatRoomId}/messages`);
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            resolve(messages);
        });
        
        // Note: SWR will handle cleanup automatically
        return unsubscribe;
    });
};