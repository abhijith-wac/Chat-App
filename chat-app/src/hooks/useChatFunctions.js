import { useState, useRef, useEffect } from "react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { sendMessage } from "../services/sendMessage";
import { deleteMessage, editMessage } from "../hooks/useMessages";

const useChatFunctions = (chatId, loggedInUser, userId, messages) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef(null);
  const firstUnseenMessageRef = useRef(null);

  const handleSendMessage = async () => {
    if (text.trim()) {
      await sendMessage(chatId, loggedInUser?.uid, userId, text);
      setText("");
      setShowEmojiPicker(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prevText) => prevText + emojiData.emoji);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editingMessageId) {
      } else {
        handleSendMessage();
      }
    }
  };

  const toggleMessageOptions = (msgId) => {
    setShowOptions((prev) => (prev === msgId ? null : msgId));
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
    setShowOptions(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const saveEditedMessage = async (msg) => {
    if (editText.trim() && editText !== msg.text) {
      await editMessage(chatId, msg.id, editText);
    }
    cancelEditing();
  };

  const addEmoji = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return "Offline";
    
    const date = lastSeenDate.toDate ? lastSeenDate.toDate() : new Date(lastSeenDate);
    
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    } else if (differenceInDays(new Date(), date) < 7) {
      return `${format(date, "EEEE")} at ${format(date, "h:mm a")}`;
    } else {
      return `${format(date, "MMM d, yyyy")} at ${format(date, "h:mm a")}`;
    }
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      const firstUnseenIndex = messages.findIndex(
        (msg) => msg.receiverId === loggedInUser?.uid && msg.status === "delivered"
      );
      if (firstUnseenIndex !== -1 && firstUnseenMessageRef.current) {
        firstUnseenMessageRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, loggedInUser?.uid]);

  return {
    text,
    setText,
    showEmojiPicker,
    setShowEmojiPicker,
    showOptions,
    setShowOptions,
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
    addEmoji,
    formatLastSeen, 
  };
};

export default useChatFunctions;