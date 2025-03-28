import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Form, Button, ListGroup, InputGroup } from "react-bootstrap";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import useMessages from "../hooks/useMessages";
import useUserDetails from "../hooks/useUserDetails"; // Fetch user details
import { sendMessage } from "../services/sendMessage";
import { FaRegSmile, FaMicrophone, FaPaperPlane } from "react-icons/fa";

const Chat = () => {
  const { userId } = useParams();
  const [loggedInUser] = useAtom(userAtom);
  const chatId = [loggedInUser?.uid, userId].sort().join("_");
  const { data: messages } = useMessages(chatId);
  const { data: userDetails } = useUserDetails(userId);
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(chatId, loggedInUser?.uid, userId, text);
    setText("");
  };

  return (
    <Container className="d-flex flex-column vh-100 p-0">
      {/* Chat Header */}
      <Card.Header className="bg-success text-white py-2 d-flex align-items-center px-3 shadow-sm">
        {/* Profile Image */}
        <img
          src={`https://ui-avatars.com/api/?name=${userDetails?.displayName || "User"}&background=random`}
          alt="User Avatar"
          className="rounded-circle me-2"
          style={{ width: "45px", height: "45px", objectFit: "cover" }}
        />
        {/* Name & Status */}
        <div>
          <h6 className="m-0 fw-bold" style={{ fontSize: "16px" }}>
            {userDetails?.displayName || "User"}
          </h6>
          <small className="text-light" style={{ fontSize: "12px" }}>Online</small>
        </div>
      </Card.Header>

      {/* Chat Messages */}
      <ListGroup className="flex-grow-1 overflow-auto p-3" style={{ background: "#e5ddd5" }}>
        {messages?.map((msg) => (
          <ListGroup.Item
            key={msg.id}
            className={`d-flex ${msg.senderId === loggedInUser?.uid ? "justify-content-end" : "justify-content-start"} border-0`}
            style={{ background: "transparent" }}
          >
            <div
              className={`p-2 rounded text-white shadow-sm ${
                msg.senderId === loggedInUser?.uid ? "bg-success" : "bg-secondary"
              }`}
              style={{ maxWidth: "75%", fontSize: "14px" }}
            >
              {msg.text}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Message Input */}
      <Card.Footer className="p-2 bg-light">
        <InputGroup>
          <Button variant="outline-secondary">
            <FaRegSmile />
          </Button>
          <Form.Control
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={{ fontSize: "14px" }}
          />
          <Button variant="outline-secondary">
            <FaMicrophone />
          </Button>
          <Button variant="success" onClick={handleSend}>
            <FaPaperPlane />
          </Button>
        </InputGroup>
      </Card.Footer>
    </Container>
  );
};

export default Chat;
