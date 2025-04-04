import React from "react";
import Users from "./Users";
import Settings from "./Settings";
import "../styles/sidebar.css";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAtomValue } from "jotai";
import { useSidebar } from "../hooks/useSidebar";
import { selectedUserAtom } from "../atoms/sidebarAtom";

const Sidebar = () => {
  const { isOpen, toggleSidebar, handleUserSelect, closeSidebar } = useSidebar();
  const selectedUserId = useAtomValue(selectedUserAtom    );

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "active" : ""}`}>
        <Users selectedUserId={selectedUserId} onSelectUser={handleUserSelect} />
        <Settings />
      </div>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 999,
            display: "block",
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
