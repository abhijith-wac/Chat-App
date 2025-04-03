import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/config";

const useMessages = (chatId, userId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
    });

    return () => unsubscribe(); 
  }, [chatId]);

  return messages;
};

export const markMessagesAsSeen = async (chatId, userId) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, where("receiverId", "==", userId), where("status", "==", "delivered"));

  const querySnapshot = await getDocs(q);
  const updatePromises = querySnapshot.docs.map((msg) =>
    updateDoc(doc(db, "chats", chatId, "messages", msg.id), { status: "seen" })
  );
  
  await Promise.all(updatePromises);
};


export default useMessages;