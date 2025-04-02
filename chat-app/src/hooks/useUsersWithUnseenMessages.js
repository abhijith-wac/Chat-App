import useSWR from "swr";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/config";

// Fetch users and unseen messages for the logged-in user
const fetchUsersWithUnseenMessages = async (userId, searchQuery = "") => {
  if (!userId) return [];

  // Fetch all users
  const usersSnapshot = await getDocs(collection(db, "users"));
  let users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Filter users based on search query (case insensitive)
  if (searchQuery) {
    users = users.filter((user) =>
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Fetch chats where the logged-in user is a participant
  const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", userId));
  const chatsSnapshot = await getDocs(chatsQuery);

  let unseenMessagesCount = {};

  // Iterate over each chat to fetch unseen messages
  for (const chatDoc of chatsSnapshot.docs) {
    const messagesQuery = query(
      collection(db, `chats/${chatDoc.id}/messages`),
      where("receiverId", "==", userId),
      where("status", "in", ["delivered"]) // ✅ Use "in" instead of "!="
    );

    const messagesSnapshot = await getDocs(messagesQuery);

    messagesSnapshot.docs.forEach((doc) => {
      const { senderId } = doc.data();
      unseenMessagesCount[senderId] = (unseenMessagesCount[senderId] || 0) + 1;
    });
  }

  // Merge unseen message count into user objects
  return users.map((user) => ({
    ...user,
    unseenMessages: unseenMessagesCount[user.uid] || 0, // ✅ Ensure correct mapping
  }));
};

// SWR Hook to fetch users with unseen message count and search query
const useUsersWithUnseenMessages = (userId, searchQuery = "") => {
  const { data, error } = useSWR(userId ? ["usersWithMessages", userId, searchQuery] : null, () =>
    fetchUsersWithUnseenMessages(userId, searchQuery)
  );

  return {
    users: data || [],
    isLoading: !data && !error,
    error,
  };
};

export default useUsersWithUnseenMessages;
