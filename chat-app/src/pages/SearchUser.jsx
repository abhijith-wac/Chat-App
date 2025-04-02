import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import "../styles/searchUser.css";

const SearchUser = ({ searchQuery, setSearchQuery }) => {
  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="search-container">
      <h5 className="mb-3">Chats</h5>
      <InputGroup className="search-input-group">
        <InputGroup.Text>
          <BsSearch />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search user..."
          value={searchQuery}
          onChange={handleChange}
          autoFocus
        />
      </InputGroup>
    </div>
  );
};

export default SearchUser;
