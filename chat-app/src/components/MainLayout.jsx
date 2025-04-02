import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/Sidebar";
import "../styles/mainLayout.css";

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;