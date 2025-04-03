import { useRef } from "react";
import useUsersWithUnseenMessages from "./useUsersWithUnseenMessages";

const useFilteredUsers = (loggedInUser, searchQuery) => {
  const previousUsersRef = useRef([]);
  const { users, loading, error } = useUsersWithUnseenMessages(loggedInUser?.uid, searchQuery);

  let displayedUsers = loading ? previousUsersRef.current : users;

  displayedUsers = displayedUsers.filter(user => user.uid !== loggedInUser?.uid);

  if (!loading && users.length > 0) {
    previousUsersRef.current = users;
  }

  const getInitials = (name) => name ? name.trim().split(" ").map(word => word[0]).join("").toUpperCase() : "?";

  const getAvatarColor = (userId) => {
    const colors = ["#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e", "#d35400", "#8e44ad"];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return { displayedUsers, loading, error, getInitials, getAvatarColor };
};

export default useFilteredUsers;
