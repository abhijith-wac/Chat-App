import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Container, Form, Button } from "react-bootstrap";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import useMessages, { deleteMessage } from "../hooks/useMessages";
import useUserDetails from "../hooks/useUserDetails";
import { FaRegSmile, FaPaperPlane, FaEllipsisV, FaArrowLeft, FaTrash } from "react-icons/fa";
import { BsMic, BsImageFill, BsCheck2All, BsCheck2 } from "react-icons/bs";
import { handleSend, handleKeyDown } from "../utils/chatHandlers";
import EmojiPicker from "emoji-picker-react";
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
    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    // Group messages by date
    const groupMessagesByDate = () => {
        const groups = {};
        messages?.forEach(msg => {
            const date = msg.timestamp ? 
                format(new Date(msg.timestamp.seconds * 1000), "MMMM d, yyyy") : 
                "Today";
            
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
                <div className="chat-header-actions">
                    <Button variant="link" className="header-action-btn">
                        <BsImageFill />
                    </Button>
                    <Button variant="link" className="header-action-btn">
                        <FaEllipsisV />
                    </Button>
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
                                <div 
                                    key={msg.id} 
                                    className={`message-wrapper ${isSender ? "sender" : "receiver"}`}
                                >
                                    <div 
                                        className={`message-bubble ${isSender ? "sender-bubble" : "receiver-bubble"}`}
                                        onClick={() => toggleMessageOptions(msg.id)}
                                    >
                                        <p className="message-text">{msg.text}</p>
                                        <div className="message-meta">
                                            <span className="message-time">
                                                {msg.timestamp ? format(new Date(msg.timestamp.seconds * 1000), "h:mm a") : ""}
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
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => {
                                                    deleteMessage(chatId, msg.id);
                                                    setShowOptions(null);
                                                }}
                                            >
                                                <FaTrash /> Delete
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
                <div className="input-actions">
                    <Button 
                        variant="link" 
                        className="input-action-btn"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <FaRegSmile />
                    </Button>
                    <Button variant="link" className="input-action-btn">
                        <BsImageFill />
                    </Button>
                </div>
                
                <div className="input-container">
                    <Form.Control
                        as="textarea"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={onKeyDown}
                        className="message-input"
                    />
                </div>
                
                <div className="send-actions">
                    {text.trim() ? (
                        <Button 
                            className="send-button" 
                            onClick={sendMessage}
                        >
                            <FaPaperPlane />
                        </Button>
                    ) : (
                        <Button className="mic-button">
                            <BsMic />
                        </Button>
                    )}
                </div>

                {showEmojiPicker && (
                    <div className="emoji-picker-container">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;