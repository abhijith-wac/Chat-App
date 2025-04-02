import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import { ListGroup, Spinner, Image, Badge } from "react-bootstrap";
import SearchUser from "./SearchUser";
import "../styles/users.css";
import useUsersWithUnseenMessages from "../hooks/useUsersWithUnseenMessages";

const Users = () => {
  const navigate = useNavigate();
  const [loggedInUser] = useAtom(userAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const { users, isLoading, error } = useUsersWithUnseenMessages(loggedInUser?.uid, searchQuery);

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (userId) => {
    const colors = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"];
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const filteredUsers = users.filter(
    (user) => user.uid !== loggedInUser?.uid
  );

  if (isLoading) return <div className="d-flex justify-content-center pt-4"><Spinner animation="border" variant="light" size="sm" /></div>;
  if (error) return <p className="text-center p-3 text-warning">Error: {error.message}</p>;

  console.log("Rendered users:", filteredUsers);

  return (
    <div className="users-container">
      <SearchUser searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ListGroup variant="flush">
        {filteredUsers.map((user) => (
          <ListGroup.Item
            key={user.uid}
            action
            className="d-flex align-items-center user-item"
            onClick={() => navigate(`/mainchatpage/chat/${user.uid}`)}
          >
            {user.photoURL ? (
              <Image src={user.photoURL} roundedCircle width={40} height={40} className="me-3 flex-shrink-0 user-avatar" />
            ) : (
              <div className="text-avatar me-3 flex-shrink-0" style={{ backgroundColor: getAvatarColor(user.uid) }}>
                {getInitials(user.displayName)}
              </div>
            )}
            <div className="user-info flex-grow-1">
              <strong className="d-block">{user.displayName}</strong>
              <p className="m-0">Tap to chat</p>
            </div>
            {user.unseenMessages > 0 && (
              <Badge pill bg="danger" className="ms-auto">
                {user.unseenMessages}
              </Badge>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Users;