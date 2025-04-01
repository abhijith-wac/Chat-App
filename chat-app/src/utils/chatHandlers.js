// chatHandlers.js
import { sendMessage } from "../services/sendMessage";

/**
 * Handles sending a message
 * @param {string} chatId - The unique identifier for the chat
 * @param {string} senderId - The sender's user ID
 * @param {string} receiverId - The receiver's user ID
 * @param {string} text - The message text to send
 * @param {Function} setText - State setter function to clear the input
 * @returns {Promise<void>}
 */
export const handleSend = async (chatId, senderId, receiverId, text, setText) => {
  if (!text.trim()) return;
  await sendMessage(chatId, senderId, receiverId, text);
  setText("");
};

/**
 * Handles key down events for the message input
 * @param {Event} e - The keyboard event
 * @param {Function} sendFunction - The function to call when Enter is pressed
 * @returns {void}
 */
export const handleKeyDown = (e, sendFunction) => {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      // Allow Shift+Enter to insert a new line
      return;
    } else {
      // Regular Enter will send the message
      e.preventDefault();
      sendFunction();
    }
  }
};