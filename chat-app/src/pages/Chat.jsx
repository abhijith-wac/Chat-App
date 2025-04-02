import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Form, Button } from "react-bootstrap";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import useMessages, { deleteMessage, editMessage } from "../hooks/useMessages";
import useUserDetails from "../hooks/useUserDetails";
import { FaPaperPlane, FaArrowLeft, FaTrash, FaEdit } from "react-icons/fa";
import { BsCheck2All, BsCheck2 } from "react-icons/bs";
import { handleSend, handleKeyDown } from "../utils/chatHandlers";
import "../styles/chat.css";

const Chat = () => {
    const { userId } = useParams();
    const [loggedInUser] = useAtom(userAtom);
    const chatId = [loggedInUser?.uid, userId].sort().join("_");
    const { data: messages } = useMessages(chatId, loggedInUser?.uid);
    const { data: userDetails } = useUserDetails(userId);
    
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showOptions, setShowOptions] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null); // Track the message being edited
    const [editText, setEditText] = useState(""); // Store edited text

    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = () => {
        if (text.trim()) {
            handleSend(chatId, loggedInUser?.uid, userId, text, setText);
            setShowEmojiPicker(false);
        }
    };

    const onKeyDown = (e) => {
        handleKeyDown(e, sendMessage);
    };

    const handleEmojiClick = (emojiData) => {
        setText((prevText) => prevText + emojiData.emoji);
    };

    const toggleMessageOptions = (msgId) => {
        setShowOptions(showOptions === msgId ? null : msgId);
    };

    // Start editing a message
    const startEditing = (msg) => {
        setEditingMessageId(msg.id);
        setEditText(msg.text);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingMessageId(null);
        setEditText("");
    };

    // Save edited message
    const saveEditedMessage = async (msg) => {
        if (editText.trim() && editText !== msg.text) {
            await editMessage(chatId, msg.id, editText);
        }
        cancelEditing();
    };

    // Group messages by date
    const groupMessagesByDate = () => {
        const groups = {};
        messages?.forEach((msg) => {
            const date = msg.timestamp
                ? format(new Date(msg.timestamp.seconds * 1000), "MMMM d, yyyy")
                : "Today";

            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    const groupedMessages = groupMessagesByDate();

    return (
        <div className="chat-app-container">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <Button className="back-button" variant="link">
                        <FaArrowLeft />
                    </Button>
                    <div className="avatar-container">
                        <img
                            src={`https://ui-avatars.com/api/?name=${userDetails?.displayName || "User"}&background=random`}
                            alt="User Avatar"
                            className="user-avatar"
                        />
                        {userDetails?.online && <span className="online-indicator"></span>}
                    </div>
                    <div className="user-info">
                        <h5>{userDetails?.displayName || "User"}</h5>
                        <span className="user-status">
                            {userDetails?.online
                                ? "Active now"
                                : userDetails?.lastSeen
                                    ? `Last seen ${format(userDetails?.lastSeen?.toDate?.() || new Date(), "h:mm a")}`
                                    : "Offline"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container" ref={messageContainerRef}>
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date} className="message-date-group">
                        <div className="date-divider">
                            <span>{date}</span>
                        </div>

                        {dateMessages.map((msg) => {
                            const isSender = msg.senderId === loggedInUser?.uid;
                            return (
                                <div key={msg.id} className={`message-wrapper ${isSender ? "sender" : "receiver"}`}>
                                    <div
                                        className={`message-bubble ${isSender ? "sender-bubble" : "receiver-bubble"}`}
                                        onClick={() => toggleMessageOptions(msg.id)}
                                        onDoubleClick={() => startEditing(msg)}
                                    >
                                        {editingMessageId === msg.id ? (
                                            <Form.Control
                                                as="textarea"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && saveEditedMessage(msg)}
                                                className="edit-message-input"
                                            />
                                        ) : (
                                            <p className="message-text">
                                                {msg.text} {msg.edited && <small>(edited)</small>}
                                            </p>
                                        )}

                                        <div className="message-meta">
                                            <span className="message-time">
                                                {msg.timestamp
                                                    ? format(new Date(msg.timestamp.seconds * 1000), "h:mm a")
                                                    : ""}
                                            </span>
                                            {isSender && (
                                                <span className="message-status">
                                                    {msg.status === "seen" ? <BsCheck2All className="seen" /> :
                                                     msg.status === "delivered" ? <BsCheck2All /> : <BsCheck2 />}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {isSender && showOptions === msg.id && (
                                        <div className="message-options">
                                        <Button 
                                            variant="outline-primary" 
                                            size="xs" 
                                            className="action-btn" 
                                            onClick={() => startEditing(msg)}
                                        >
                                            <FaEdit className="icon" /> Edit
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="xs" 
                                            className="action-btn" 
                                            onClick={() => deleteMessage(chatId, msg.id)}
                                        >
                                            <FaTrash className="icon" /> Delete
                                        </Button>
                                    </div>
                                    
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
                <Form.Control
                    as="textarea"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="message-input"
                />
                <Button className="send-button" onClick={sendMessage}>
                    <FaPaperPlane />
                </Button>
            </div>
        </div>
    );
};

export default Chat;
