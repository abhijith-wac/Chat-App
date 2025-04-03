import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import { ListGroup, Spinner, Image, Badge } from "react-bootstrap";
import SearchUser from "./SearchUser";
import useFilteredUsers from "../hooks/useFilteredUsers";
import "../styles/users.css";

const Users = () => {
  const navigate = useNavigate();
  const [loggedInUser] = useAtom(userAtom);
  const [searchQuery, setSearchQuery] = useState("");

  const { displayedUsers, isLoading, error, getInitials, getAvatarColor } = useFilteredUsers(loggedInUser, searchQuery);

  if (error) return <p className="text-center p-3 text-warning">Error: {error.message}</p>;

  return (
    <div className="users-container">
      <SearchUser searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {isLoading && displayedUsers.length === 0 && (
        <div className="d-flex justify-content-center pt-4">
          <Spinner animation="border" variant="light" size="sm" />
        </div>
      )}

      <ListGroup variant="flush">
        {displayedUsers.map((user) => (
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
            {user.unseenMessages > 0 && <Badge pill bg="danger">{user.unseenMessages}</Badge>}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Users;
