import useSWR from "swr";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/config";

// Fetch users and unseen messages for the logged-in user
const fetchUsersWithUnseenMessages = async (userId) => {
  if (!userId) return [];

  // Fetch all users
  const usersSnapshot = await getDocs(collection(db, "users"));
  const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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

  console.log("Unseen message count keys:", Object.keys(unseenMessagesCount)); // Debugging
  console.log("Unseen message count:", unseenMessagesCount); // Debugging

  // Merge unseen message count into user objects
  const finalUsers = users.map((user) => ({
    ...user,
    unseenMessages: unseenMessagesCount[user.uid] || 0, // ✅ Ensure correct mapping
  }));

  console.log("Final users data:", finalUsers); // Debugging
  return finalUsers;
};

// SWR Hook to fetch users with unseen message count
const useUsersWithUnseenMessages = (userId) => {
  const { data, error } = useSWR(userId ? ["usersWithMessages", userId] : null, () =>
    fetchUsersWithUnseenMessages(userId)
  );

  return {
    users: data || [],
    isLoading: !data && !error,
    error,
  };
};

export default useUsersWithUnseenMessages;
