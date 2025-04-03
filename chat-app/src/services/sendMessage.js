import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

const isRecipientOnline = async (receiverId) => {
  const userRef = doc(db, "users", receiverId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() && userSnap.data().isOnline;
};

export const sendMessage = async (chatId, senderId, receiverId, text) => {
  const messagesRef = collection(db, "chats", chatId, "messages");

  const messageData = {
    senderId,
    receiverId,
    text,
    timestamp: serverTimestamp(),
    status: "sent",
  };

  if (await isRecipientOnline(receiverId)) {
    messageData.status = "delivered";
  }

  await addDoc(messagesRef, messageData);
};

export const markMessageAsSeen = async (chatId, messageId) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, { status: "seen" });
};
