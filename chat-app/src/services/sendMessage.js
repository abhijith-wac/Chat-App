import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { ref, get } from "firebase/database";
import { db, rtdb } from "./config";

// ✅ Use Realtime Database to check if the recipient is online (instant update)
const isRecipientOnline = async (receiverId) => {
  const statusRef = ref(rtdb, `/status/${receiverId}`);
  const snapshot = await get(statusRef);
  return snapshot.exists() && snapshot.val().online;
};

// ✅ Send message and check recipient's online status in real time
export const sendMessage = async (chatId, senderId, receiverId, text) => {
  const messagesRef = collection(db, "chats", chatId, "messages");

  const messageData = {
    senderId,
    receiverId,
    text,
    timestamp: serverTimestamp(),
    status: "sent", // Default status
  };

  // Check if recipient is online (uses RTDB for instant update)
  if (await isRecipientOnline(receiverId)) {
    messageData.status = "delivered";
  }

  await addDoc(messagesRef, messageData);
};

// ✅ Mark message as "seen"
export const markMessageAsSeen = async (chatId, messageId) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, { status: "seen" });
};
