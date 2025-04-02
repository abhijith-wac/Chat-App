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

  // Batch update to mark unseen messages as "seen" (reduces Firestore writes)
  const updatePromises = unseenMessages.map((msg) =>
    updateDoc(doc(db, "chats", chatId, "messages", msg.id), { status: "seen" })
  );
  await Promise.all(updatePromises);

  return messages;
};

// Delete a message
export const deleteMessage = async (chatId, messageId) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await deleteDoc(messageRef);
};

// Edit a message
export const editMessage = async (chatId, messageId, newContent) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, {
    content: newContent,
    edited: true, // ✅ Mark as edited
    editedAt: new Date().toISOString(), // ✅ Track edit time
  });
};

const useMessages = (chatId, userId) => {
  return useSWR(chatId ? ["messages", chatId, userId] : null, fetchMessages, {
    refreshInterval: 1000, // Auto-refresh every second
  });
};

export default useMessages;
