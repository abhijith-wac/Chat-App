import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/Sidebar";

const MainLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "250px", background: "#f0f0f0", padding: "10px" }}>
        <Sidebar />
      </div>

      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
