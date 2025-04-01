import React from "react";
import SearchUser from "./SearchUser";
import Users from "./Users";
import Settings from "./Settings";

const Sidebar = () => {
  return (
    <div className="sidebar d-flex flex-column h-100 position-relative">
      <SearchUser />
      <Users />
      <Settings /> {/* Always at the bottom */}
    </div>
  );
};

export default Sidebar;
