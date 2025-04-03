import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./config";

const isRecipientOnline = async (receiverId) => {
  const userRef = doc(db, "users", receiverId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() && userSnap.data().isOnline;
};

export const sendMessage = async (chatId, senderId, receiverId, text) => {
  if (!text.trim()) return;

  try {
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

     if (!chatSnap.exists()) {
      await setDoc(chatRef, { createdAt: serverTimestamp() }, { merge: true });
    }

     const messagesRef = collection(db, "chats", chatId, "messages");

    const messageData = {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      status: (await isRecipientOnline(receiverId)) ? "delivered" : "sent",
    };

    await addDoc(messagesRef, messageData);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export const markMessageAsSeen = async (chatId, messageId) => {
  try {
    const messageRef = doc(db, "chats", chatId, "messages", messageId);
    await updateDoc(messageRef, { status: "seen" });
  } catch (error) {
    console.error("Error marking message as seen:", error);
  }
};
