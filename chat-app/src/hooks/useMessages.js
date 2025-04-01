import useSWR from "swr";
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/config";

// Fetch messages for a chat
const fetchMessages = async ([_, chatId, userId]) => {
  if (!chatId || !userId) return [];

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const querySnapshot = await getDocs(q);

  const messages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Mark messages as "seen" if they are sent to the logged-in user
  const unseenMessages = messages.filter((msg) => msg.receiverId === userId && msg.status !== "seen");
  for (const msg of unseenMessages) {
    await updateDoc(doc(db, "chats", chatId, "messages", msg.id), { status: "seen" });
  }

  return messages;
};

// Delete a message
export const deleteMessage = async (chatId, messageId) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await deleteDoc(messageRef);
};

const useMessages = (chatId, userId) => {
  return useSWR(chatId ? ["messages", chatId, userId] : null, fetchMessages, {
    refreshInterval: 1000, // Auto-refresh every second
  });
};

export default useMessages;
