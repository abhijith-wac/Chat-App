import useSWR from "swr";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/config";

const fetchUsersWithUnseenMessages = async (userId, searchQuery = "") => {
  if (!userId) return [];

  const usersSnapshot = await getDocs(collection(db, "users"));
  let users = usersSnapshot.docs.map((doc) => ({ 
    id: doc.id,
    uid: doc.id, // Add uid for backward compatibility
    ...doc.data() 
  }));

  if (searchQuery) {
    users = users.filter((user) =>
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", userId));
  const chatsSnapshot = await getDocs(chatsQuery);

  let unseenMessagesCount = {};

  for (const chatDoc of chatsSnapshot.docs) {
    const messagesQuery = query(
      collection(db, `chats/${chatDoc.id}/messages`),
      where("receiverId", "==", userId),
      where("status", "in", ["delivered"]) 
    );

    const messagesSnapshot = await getDocs(messagesQuery);

    messagesSnapshot.docs.forEach((doc) => {
      const { senderId } = doc.data();
      unseenMessagesCount[senderId] = (unseenMessagesCount[senderId] || 0) + 1;
    });
  }

  return users.map((user) => ({
    ...user,
    unseenMessages: unseenMessagesCount[user.id] || 0, // Use user.id instead of user.uid
  }));
};

const useUsersWithUnseenMessages = (userId, searchQuery = "") => {
  const { data, error, isValidating } = useSWR(
    userId ? ["usersWithMessages", userId, searchQuery] : null,
    () => fetchUsersWithUnseenMessages(userId, searchQuery),
    {
      keepPreviousData: true, 
      refreshInterval: 10000, 
      revalidateOnFocus: true, 
    }
  );

  return {
    users: data || [],
    isLoading: !data && !error,
    isValidating, 
    error,
  };
};

export default useUsersWithUnseenMessages;