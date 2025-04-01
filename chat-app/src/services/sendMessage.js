import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

// Function to check if the recipient is online
const isRecipientOnline = async (receiverId) => {
  const userRef = doc(db, "users", receiverId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() && userSnap.data().isOnline;
};

export const sendMessage = async (chatId, senderId, receiverId, text) => {
  const messagesRef = collection(db, "chats", chatId, "messages");

  // Initially, message is "sent"
  const messageData = {
    senderId,
    receiverId,
    text,
    timestamp: serverTimestamp(),
    status: "sent",
  };

  // Check if recipient is online before sending
  if (await isRecipientOnline(receiverId)) {
    messageData.status = "delivered";
  }

  await addDoc(messagesRef, messageData);
};

// Mark a message as "seen" when recipient opens the chat
export const markMessageAsSeen = async (chatId, messageId) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, { status: "seen" });
};
