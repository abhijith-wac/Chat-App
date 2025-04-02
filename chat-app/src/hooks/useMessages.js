import useSWR from "swr";
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/config";

const fetchMessages = async ([_, chatId, userId]) => {
  if (!chatId || !userId) return [];

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const querySnapshot = await getDocs(q);

  const messages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  console.log("Fetched messages:", messages);
  return messages;
};

export const markMessagesAsSeen = async (chatId, userId) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, where("receiverId", "==", userId), where("status", "==", "delivered"));
  const querySnapshot = await getDocs(q);

  const unseenMessages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const updatePromises = unseenMessages.map((msg) =>
    updateDoc(doc(db, "chats", chatId, "messages", msg.id), { status: "seen" })
  );
  await Promise.all(updatePromises);
};

export const deleteMessage = async (chatId, messageId) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await deleteDoc(messageRef);
};

export const editMessage = async (chatId, messageId, newContent) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, {
    text: newContent, // Use 'text' to match other components
    edited: true,
    editedAt: new Date().toISOString(),
  });
};

const useMessages = (chatId, userId) => {
  return useSWR(
    chatId ? ["messages", chatId, userId] : null,
    fetchMessages,
    {
      refreshInterval: 5000, 
      revalidateOnFocus: true,
      dedupingInterval: 2000, 
    }
  );
};

export default useMessages;