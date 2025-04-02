import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Form, Button } from "react-bootstrap";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import useMessages, { deleteMessage, markMessagesAsSeen } from "../hooks/useMessages";
import useUserDetails from "../hooks/useUserDetails";
import { FaPaperPlane, FaArrowLeft, FaTrash, FaEdit, FaRegSmile } from "react-icons/fa";
import { BsImageFill, BsMic } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import useChatFunctions from "../hooks/useChatFunctions";
import "../styles/chat.css";

const Chat = () => {
  const { userId } = useParams();
  const [loggedInUser] = useAtom(userAtom);
  const chatId = [loggedInUser?.uid, userId].sort().join("_");

  const { data: messages, mutate } = useMessages(chatId, loggedInUser?.uid);
  const { data: userDetails } = useUserDetails(userId);

  const {
    text,
    setText,
    showEmojiPicker,
    setShowEmojiPicker,
    showOptions,
    editingMessageId,
    editText,
    setEditText,
    messagesEndRef,
    firstUnseenMessageRef,
    handleSendMessage,
    handleEmojiClick,
    handleKeyDown,
    toggleMessageOptions,
    startEditing,
    cancelEditing,
    saveEditedMessage,
  } = useChatFunctions(chatId, loggedInUser, userId, messages);

  useEffect(() => {
    if (chatId && loggedInUser?.uid && messages) {
      markMessagesAsSeen(chatId, loggedInUser.uid)
        .then(() => mutate())
        .catch((error) => console.error("Error marking messages as seen:", error));
    }
  }, [chatId, loggedInUser?.uid, messages, mutate]);

  const groupedMessages = messages?.reduce((groups, msg) => {
    const date = msg.timestamp
      ? format(new Date(msg.timestamp.seconds * 1000), "MMMM d, yyyy")
      : "Today";
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="chat-app-container">
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

      <div className="messages-container">
        {groupedMessages &&
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
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
                  <div
                    key={msg.id}
                    className={`message-wrapper ${isSender ? "sender" : "receiver"}`}
                    ref={isFirstUnseen ? firstUnseenMessageRef : null}
                  >
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
                    </div>
                    {isSender && showOptions === msg.id && (
                      <div className="message-options">
                        <Button variant="outline-primary" size="xs" onClick={() => startEditing(msg)}>
                          <FaEdit /> Edit
                        </Button>
                        <Button variant="outline-danger" size="xs" onClick={() => deleteMessage(chatId, msg.id)}>
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
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;