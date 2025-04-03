import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Form, Button } from "react-bootstrap";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import {
  messagesAtom,
  textAtom,
  emojiPickerAtom,
  selectedMessageAtom,
  editingMessageAtom,
  editTextAtom,
  userDetailsAtom,
} from "../atoms/chatAtom";
import useChatFunctions from "../hooks/useChatFunctions";
import useUserDetails from "../hooks/useUserDetails";
import { FaPaperPlane, FaArrowLeft, FaEdit, FaTrash, FaRegSmile } from "react-icons/fa";
import { BsImageFill, BsMic } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import "../styles/chat.css";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loggedInUser] = useAtom(userAtom);
  const [messages] = useAtom(messagesAtom);
  const [text, setText] = useAtom(textAtom);
  const [showEmojiPicker, setShowEmojiPicker] = useAtom(emojiPickerAtom);
  const [selectedMessage, setSelectedMessage] = useAtom(selectedMessageAtom);
  const [editingMessageId, setEditingMessageId] = useAtom(editingMessageAtom);
  const [editText, setEditText] = useAtom(editTextAtom);
  const [userDetails] = useAtom(userDetailsAtom);

  useUserDetails(userId);

  const chatId = [loggedInUser?.uid, userId].sort().join("_");

  const {
    messagesEndRef,
    firstUnseenMessageRef,
    handleSendMessage,
    handleKeyDown,
    startEditing,
    cancelEditing,
    saveEditedMessage,
    deleteMessage,
    formatLastSeen,
    markMessagesAsSeen
  } = useChatFunctions(chatId, loggedInUser, userId);

   useEffect(() => {
    if (loggedInUser && messages.length > 0) {
      markMessagesAsSeen();
    }
  }, [loggedInUser, messages]);

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = msg.timestamp
      ? format(new Date(msg.timestamp.seconds * 1000), "MMMM d, yyyy")
      : "Today";
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="chat-app-container">
       <div className="chat-header">
        <div className="chat-header-left">
          <Button className="back-button" variant="link" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </Button>
          <div className="avatar-container">
            <img
              src={`https://ui-avatars.com/api/?name=${userDetails?.displayName || "Unknown"}&background=random`}
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
                  ? formatLastSeen(userDetails.lastSeen)
                  : "Offline"}
            </span>
          </div>
        </div>
      </div>

       <div className="messages-container" onClick={() => setSelectedMessage(null)}>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="message-date-group">
            <div className="date-divider">
              <span>{date}</span>
            </div>
            
            {dateMessages.map((msg, index) => {
              const isSender = msg.senderId === loggedInUser?.uid;
              const isFirstUnseen =
                msg.receiverId === loggedInUser?.uid &&
                msg.status === "delivered" &&
                (index === 0 || dateMessages[index - 1].status === "seen");
              
              return (
                <React.Fragment key={msg.id}>
                   {isFirstUnseen && index > 0 && (
                    <div className="unread-divider">
                      <span>Unread Messages</span>
                    </div>
                  )}
                  
                  <div
                    className={`message-wrapper ${isSender ? "sender" : "receiver"}`}
                    ref={isFirstUnseen ? firstUnseenMessageRef : null}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className={`message-bubble ${isSender ? "sender-bubble" : "receiver-bubble"}`}
                      onClick={() => setSelectedMessage((prev) => (prev === msg.id ? null : msg.id))}
                    >
                      {editingMessageId === msg.id ? (
                        <>
                          <Form.Control
                            as="textarea"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditedMessage();
                              if (e.key === "Escape") cancelEditing();
                            }}
                            className="edit-message-input"
                            autoFocus
                          />
                          <div className="edit-actions">
                            <Button variant="primary" size="sm" onClick={saveEditedMessage}>
                              Save
                            </Button>
                            <Button variant="secondary" size="sm" onClick={cancelEditing}>
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="message-content">
                          <p className="message-text">
                            {msg.text} {msg.edited && <small>(edited)</small>}
                          </p>
                          <div className="message-meta">
                            <span className="message-time">
                              {msg.timestamp
                                ? format(new Date(msg.timestamp.seconds * 1000), "h:mm a")
                                : ""}
                            </span>
                             {isSender && (
                              <span className="message-status">
                                {msg.status === "sent" && <span className="status-sent">✓</span>}
                                {msg.status === "delivered" && <span className="status-delivered">✓✓</span>}
                                {msg.status === "seen" && <span className="status-seen">✓✓</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                     {isSender && selectedMessage === msg.id && (
                      <div className="message-options">
                        <Button variant="outline-primary" size="sm" onClick={() => startEditing(msg)}>
                          <FaEdit /> Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => deleteMessage(msg.id)}>
                          <FaTrash /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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
            onKeyDown={handleKeyDown}
            className="message-input"
          />
        </div>

        <div className="send-actions">
          {text.trim() ? (
            <Button className="send-button" onClick={handleSendMessage}>
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
            <EmojiPicker onEmojiClick={(emoji) => setText((prev) => prev + emoji.emoji)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;