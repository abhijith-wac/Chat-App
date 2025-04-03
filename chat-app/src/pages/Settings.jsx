// Settings.jsx
import React, { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { FaCog, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import { useNavigate } from "react-router-dom";
import useAuth from "../atoms/useAuth";
import '../styles/settings.css';

const Settings = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const handleLogout = async () => {
    await logout(); 
    setUser(null); 
    navigate("/"); 
  };

  return (
    <div className="settings-container">
      {showMenu && (
        <ListGroup className="settings-menu position-absolute w-90 mb-2" style={{ bottom: "60px", left: "15px", right: "15px" }}>
          <ListGroup.Item action className="d-flex align-items-center">
            <FaUser className="me-2" />
            Profile
          </ListGroup.Item>
          <ListGroup.Item action className="d-flex align-items-center text-danger" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Logout
          </ListGroup.Item>
        </ListGroup>
      )}

      <Button
        variant="light"
        className="settings-button w-100 d-flex align-items-center justify-content-between"
        onClick={() => setShowMenu(!showMenu)}
      >
        <span>
          <FaCog className="me-2" />
          Settings
        </span>
        <span>{showMenu ? "▲" : "▼"}</span>
      </Button>
    </div>
  );
};

export default Settings;