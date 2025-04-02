// Sidebar.jsx
import React, { useState } from "react";
import SearchUser from "./SearchUser";
import Users from "./Users";
import Settings from "./Settings";
import "../styles/sidebar.css";
import { FaBars } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="sidebar-toggle d-md-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBars />
      </button>
      <div className={`sidebar d-flex flex-column h-100 position-relative ${isOpen ? 'active' : ''}`}>
        <Users />
        <Settings />
      </div>
    </>
  );
};

export default Sidebar;