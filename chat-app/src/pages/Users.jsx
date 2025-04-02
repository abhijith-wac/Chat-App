import React from "react";
import { useNavigate } from "react-router-dom";
import useUsersWithUnseenMessages from "../hooks/useUsersWithUnseenMessages";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import { ListGroup, Spinner, Image, Badge } from "react-bootstrap";
import '../styles/users.css';

const Users = () => {
  const navigate = useNavigate();
  const [loggedInUser] = useAtom(userAtom);
  
  // Fetch users along with their unseen messages
  const { users, isLoading, error } = useUsersWithUnseenMessages(loggedInUser?.uid);

  if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-3" />;
  if (error) return <p className="text-danger text-center">Error fetching users.</p>;

  return (
    <div className="users-container">
      <ListGroup variant="flush" className="overflow-auto flex-grow-1">
        {users
          .filter((user) => user.uid !== loggedInUser?.uid)
          .map((user) => (
            <ListGroup.Item
              key={user.uid}
              action
              className="d-flex align-items-center user-item"
              onClick={() => navigate(`/mainchatpage/chat/${user.uid}`)}
            >
              <Image
                src="https://via.placeholder.com/40"
                roundedCircle
                width={40}
                height={40}
                className="me-3 flex-shrink-0"
              />
              <div className="user-info">
                <strong>{user.displayName}</strong>
                <p className="text-muted small m-0">Tap to chat</p>
              </div>

              {/* Display unseen messages count if greater than 0 */}
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
