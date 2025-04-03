import useSWR from "swr";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/config";

const fetchUsersWithUnseenMessages = async (userId, searchQuery = "") => {
  if (!userId) return [];

  return new Promise((resolve, reject) => {
    const usersRef = collection(db, "users");

     const usersUnsub = onSnapshot(usersRef, async (usersSnapshot) => {
      let users = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data()
      }));

      if (searchQuery) {
        users = users.filter((user) =>
          user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

       const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", userId)
      );

      const chatsUnsub = onSnapshot(chatsQuery, async (chatsSnapshot) => {
        const unseenMessagesCount = {};

        const chatPromises = chatsSnapshot.docs.map((chatDoc) =>
          new Promise((resolve) => {
            const messagesQuery = query(
              collection(db, `chats/${chatDoc.id}/messages`),
              where("receiverId", "==", userId),
              where("status", "==", "delivered")
            );

            const messagesUnsub = onSnapshot(messagesQuery, (messagesSnapshot) => {
              messagesSnapshot.docs.forEach((doc) => {
                const { senderId } = doc.data();
                unseenMessagesCount[senderId] = (unseenMessagesCount[senderId] || 0) + 1;
              });
              resolve();
            }, (error) => {
              console.error("Message query error:", error);
              resolve();  
            });

            return () => messagesUnsub();
          })
        );

        await Promise.all(chatPromises);

        const updatedUsers = users.map((user) => ({
          ...user,
          unseenMessages: unseenMessagesCount[user.uid] || 0,
        }));

        resolve(updatedUsers);
      }, (error) => {
        console.error("Chats query error:", error);
        reject(error);
      });

       return () => chatsUnsub();
    }, (error) => {
      console.error("Users query error:", error);
      reject(error);
    });

     return () => usersUnsub();
  });
};

const useUsersWithUnseenMessages = (userId, searchQuery = "") => {
  const { data, error, isValidating, mutate } = useSWR(
    userId ? ["usersWithMessages", userId, searchQuery] : null,
    () => fetchUsersWithUnseenMessages(userId, searchQuery),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    users: data || [],
    isLoading: !data && !error,
    isValidating,
    error,
    mutate,
  };
};

export default useUsersWithUnseenMessages;
