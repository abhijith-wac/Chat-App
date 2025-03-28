import React from "react";
import { useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import { ListGroup, Spinner, Image } from "react-bootstrap";

const Users = () => {
  const navigate = useNavigate();
  const { users, isLoading, error } = useUsers();
  const [loggedInUser] = useAtom(userAtom); // Get logged-in user data

  if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-3" />;
  if (error) return <p className="text-danger text-center">Error fetching users.</p>;

  return (
    <ListGroup variant="flush" className="overflow-auto" style={{ maxHeight: "80vh" }}>
      {users
        .filter((user) => user.uid !== loggedInUser?.uid) // Exclude logged-in user
        .map((user) => (
          <ListGroup.Item
            key={user.uid}
            action
            className="d-flex align-items-center"
            onClick={() => navigate(`/mainchatpage/chat/${user.uid}`)}
          >
            <Image
              src="https://via.placeholder.com/40" // Placeholder image, replace with user's avatar
              roundedCircle
              width={40}
              height={40}
              className="me-3"
            />
            <div>
              <strong>{user.displayName}</strong>
              <p className="text-muted small m-0">Tap to chat</p>
            </div>
          </ListGroup.Item>
        ))}
    </ListGroup>
  );
};

export default Users;
