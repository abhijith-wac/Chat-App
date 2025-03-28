import useSWR from "swr";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../services/config";

const fetchMessages = async ([_, chatId]) => {
  if (!chatId) return [];
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const useMessages = (chatId) => {
  return useSWR(chatId ? ["messages", chatId] : null, fetchMessages, {
    refreshInterval: 1000, // Auto-refresh every second
  });
};

export default useMessages;
