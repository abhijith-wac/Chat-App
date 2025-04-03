 import { sendMessage } from "../services/sendMessage";

export const handleSend = async (chatId, senderId, receiverId, text, setText) => {
  if (!text.trim()) return;
  await sendMessage(chatId, senderId, receiverId, text);
  setText("");
};

export const handleKeyDown = (e, sendFunction) => {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      return;
    } else {
      e.preventDefault();
      sendFunction();
    }
  }
};