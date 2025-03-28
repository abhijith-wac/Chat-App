import React from "react";
import SearchUser from "./SearchUser";
import Users from "./Users";
import { Card } from "react-bootstrap";

const Sidebar = () => {
  return (
    <Card className="vh-100 border-end" style={{ maxWidth: "350px" }}>
      <SearchUser />
      <Users />
    </Card>
  );
};

export default Sidebar;
