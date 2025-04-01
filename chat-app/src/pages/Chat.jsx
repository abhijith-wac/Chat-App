import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Container, Card, Form, Button, ListGroup, InputGroup, Dropdown } from "react-bootstrap";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import useMessages, { deleteMessage } from "../hooks/useMessages";
import useUserDetails from "../hooks/useUserDetails";
import { FaRegSmile, FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { handleSend, handleKeyDown } from "../utils/chatHandlers";
import "../styles/chat.css"; // Import the external stylesheet

const Chat = () => {
    const { userId } = useParams();
    const [loggedInUser] = useAtom(userAtom);
    const chatId = [loggedInUser?.uid, userId].sort().join("_");
    const { data: messages } = useMessages(chatId, loggedInUser?.uid);
    const { data: userDetails } = useUserDetails(userId);
    const [text, setText] = useState("");

    // Create bound versions of the handlers for this component's specific context
    const sendMessage = () => {
        handleSend(chatId, loggedInUser?.uid, userId, text, setText);
    };

    const onKeyDown = (e) => {
        handleKeyDown(e, sendMessage);
    };

    return (
        <Container className="d-flex flex-column vh-100 p-0">
            {/* Chat Header */}
            <Card.Header className="chat-header">
                <div className="d-flex align-items-center">
                    <img
                        src={`https://ui-avatars.com/api/?name=${userDetails?.displayName || "User"}&background=random`}
                        alt="User Avatar"
                        className="chat-avatar"
                    />
                    <div>
                        <h6 className="chat-username">{userDetails?.displayName || "User"}</h6>
                        <small className="chat-status text-light">
                            {userDetails?.online
                                ? "Online"
                                : userDetails?.lastSeen
                                    ? `Last seen ${format(userDetails?.lastSeen?.toDate?.() || new Date(), "MMM d, h:mm a")}`
                                    : "Offline"}
                        </small>
                    </div>

                    {console.log("UserDetails:", userDetails)}
                    {console.log("LastSeen:", userDetails?.lastSeen)}  {/* Log lastSeen to check its value */}

                </div>
            </Card.Header>

            {/* Chat Messages */}
            <ListGroup className="chat-messages-container">
                {messages?.map((msg) => {
                    const isSender = msg.senderId === loggedInUser?.uid;
                    return (
                        <ListGroup.Item key={msg.id} className="chat-message-item">
                            <div className={`d-flex ${isSender ? "justify-content-end" : "justify-content-start"}`}>
                                <div className="chat-message-container">
                                    {/* Message Box */}
                                    <div
                                        className={`chat-message-content ${isSender ? "chat-message-sender" : "chat-message-receiver"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Timestamp and Status */}
                                    <div
                                        className={`chat-message-meta ${isSender ? "justify-content-end" : "justify-content-start"
                                            }`}
                                    >
                                        <small className="chat-message-time">
                                            {msg.timestamp ? format(new Date(msg.timestamp.seconds * 1000), "h:mm a") : ""}
                                        </small>

                                        {/* Status Indicator - Only for sender */}
                                        {isSender && (
                                            <small
                                                className={`chat-message-status ${msg.status === "seen"
                                                    ? "chat-message-status-seen"
                                                    : "chat-message-status-delivered"
                                                    }`}
                                            >
                                                {msg.status === "seen" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                                            </small>
                                        )}

                                        {/* Delete Option - Only for sender */}
                                        {isSender && (
                                            <Dropdown className="ms-2" align="end">
                                                <Dropdown.Toggle
                                                    variant="link"
                                                    bsPrefix="p-0"
                                                    id={`dropdown-${msg.id}`}
                                                    className="text-muted chat-dropdown-toggle"
                                                >
                                                    <small>⋮</small>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu size="sm">
                                                    <Dropdown.Item
                                                        className="text-danger chat-dropdown-item"
                                                        onClick={() => deleteMessage(chatId, msg.id)}
                                                    >
                                                        Delete
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>

            {/* Message Input */}
            <Card.Footer className="chat-footer">
                <InputGroup>
                    <Button variant="link" className="text-muted border-0">
                        <FaRegSmile />
                    </Button>
                    <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={onKeyDown}
                        className="chat-input"
                    />
                    <Button variant="link" className="text-muted border-0">
                        <FaMicrophone />
                    </Button>
                    <Button variant="success" onClick={sendMessage} className="chat-send-button">
                        <FaPaperPlane size={14} />
                    </Button>
                </InputGroup>
            </Card.Footer>
        </Container>
    );
};

export default Chat;
