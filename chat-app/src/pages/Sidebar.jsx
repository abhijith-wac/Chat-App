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
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1100,
          background: '#6b6bff',
          border: 'none',
          borderRadius: '5px',
          padding: '0.5rem',
          color: 'white'
        }}
      >
        <FaBars />
      </button>
      <div className={`sidebar d-flex flex-column h-100 position-relative ${isOpen ? 'active' : ''}`}>
        <SearchUser />
        <Users />
        <Settings />
      </div>
    </>
  );
};

export default Sidebar;