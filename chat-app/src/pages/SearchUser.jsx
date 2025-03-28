import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";

const SearchUser = () => {
  return (
    <div className="p-3 bg-light border-bottom">
      <h5 className="mb-3 fw-bold">Chats</h5>
      <InputGroup>
        <InputGroup.Text>
          <BsSearch />
        </InputGroup.Text>
        <Form.Control type="text" placeholder="Search user..." />
      </InputGroup>
    </div>
  );
};

export default SearchUser;
