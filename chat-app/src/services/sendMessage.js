import { db } from "../services/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const sendMessage = async (chatId, senderId, receiverId, text) => {
  if (!chatId || !text.trim()) return;

  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
