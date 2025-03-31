import React, { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { FaCog, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <div className="settings-container position-absolute w-100 p-3" style={{ bottom: 0 }}>
      {/* Drop-up Menu */}
      {showMenu && (
        <ListGroup className="bg-white shadow-sm rounded position-absolute w-100 mb-2" style={{ bottom: "45px" }}>
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

      {/* Settings Button (Always at Bottom) */}
      <Button
        variant="light"
        className="w-100 d-flex align-items-center justify-content-between"
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
