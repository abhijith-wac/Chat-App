import useSWR from "swr";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/config";

const fetchUsersWithUnseenMessages = (userId, searchQuery = "") => {
  return new Promise((resolve, reject) => {
    if (!userId) return resolve([]);

    const usersRef = collection(db, "users");
    const usersUnsub = onSnapshot(usersRef, (usersSnapshot) => {
      let users = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data()
      }));

      if (searchQuery) {
        users = users.filter((user) =>
          (user.displayName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
        );
      }

      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", userId)
      );

      const chatsUnsub = onSnapshot(chatsQuery, (chatsSnapshot) => {
        const unseenMessagesCount = {};

        const chatPromises = chatsSnapshot.docs.map((chatDoc) => {
          return new Promise((chatResolve) => {
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
              chatResolve();
            }, (error) => {
              console.error("Message query error:", error);
              chatResolve();
            });
          });
        });

        Promise.all(chatPromises)
          .then(() => {
            const updatedUsers = users.map((user) => ({
              ...user,
              unseenMessages: unseenMessagesCount[user.uid] || 0,
            }));
            resolve(updatedUsers);
          })
          .catch((error) => {
            console.error("Promise.all error:", error);
            reject(error);
          });
      }, (error) => {
        console.error("Chats query error:", error);
        reject(error);
      });
    }, (error) => {
      console.error("Users query error:", error);
      reject(error);
    });
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
