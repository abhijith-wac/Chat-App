import { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { messagesAtom, textAtom, emojiPickerAtom, selectedMessageAtom, editingMessageAtom, editTextAtom } from "../atoms/chatAtom";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import {
  collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, getDoc,
  setDoc, addDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../services/config";

const useChatFunctions = (chatId, loggedInUser, userId) => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [text, setText] = useAtom(textAtom);
  const [showEmojiPicker, setShowEmojiPicker] = useAtom(emojiPickerAtom);
  const [selectedMessage, setSelectedMessage] = useAtom(selectedMessageAtom);
  const [editingMessageId, setEditingMessageId] = useAtom(editingMessageAtom);
  const [editText, setEditText] = useAtom(editTextAtom);

  const messagesEndRef = useRef(null);
  const firstUnseenMessageRef = useRef(null);

  useEffect(() => {
    if (!chatId || !loggedInUser) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(newMessages);

      updateMessageStatus(newMessages);
    });

    return () => unsubscribe();
  }, [chatId, loggedInUser, setMessages]);

  const updateMessageStatus = async (msgs) => {
    if (!msgs.length || !loggedInUser) return;

    const messagesToUpdate = msgs.filter(
      msg => msg.receiverId === loggedInUser.uid && msg.status === "sent"
    );

    if (messagesToUpdate.length > 0) {
      const updatePromises = messagesToUpdate.map(msg =>
        updateDoc(doc(db, "chats", chatId, "messages", msg.id), {
          status: "delivered"
        })
      );

      await Promise.all(updatePromises);
    }
  };

  const markMessagesAsSeen = async () => {
    if (!messages.length || !loggedInUser) return;

    const messagesToMark = messages.filter(
      msg => msg.receiverId === loggedInUser.uid && msg.status === "delivered"
    );

    if (messagesToMark.length > 0) {
      const updatePromises = messagesToMark.map(msg =>
        updateDoc(doc(db, "chats", chatId, "messages", msg.id), {
          status: "seen"
        })
      );

      await Promise.all(updatePromises);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const hasUnseenMessages = messages.some(
        msg => msg.receiverId === loggedInUser?.uid && msg.status === "delivered"
      );

      if (hasUnseenMessages && firstUnseenMessageRef.current) {
        setTimeout(() => {
          firstUnseenMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, loggedInUser?.uid]);

  const handleSendMessage = async () => {
    if (!text.trim() || !loggedInUser) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, { createdAt: serverTimestamp() }, { merge: true });
      }

      const messageRef = collection(db, "chats", chatId, "messages");
      await addDoc(messageRef, {
        text: text.trim(),
        senderId: loggedInUser.uid,
        receiverId: userId,
        timestamp: serverTimestamp(),
        status: "sent",
      });

      setText("");
      setShowEmojiPicker(false);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      await updateDoc(chatRef, {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
        lastSenderId: loggedInUser.uid
      });

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      editingMessageId ? saveEditedMessage() : handleSendMessage();
    }
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
    setSelectedMessage(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const saveEditedMessage = async () => {
    if (!editText.trim() || !editingMessageId) return;

    const currentMessage = messages.find(msg => msg.id === editingMessageId);
    if (!currentMessage || currentMessage.text === editText.trim()) {
      cancelEditing();
      return;
    }

    try {
      await updateDoc(doc(db, "chats", chatId, "messages", editingMessageId), {
        text: editText.trim(),
        edited: true,
        editedAt: new Date().toISOString(),
      });

      cancelEditing();
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const deleteMessage = async (chatId, messageId, loggedInUser) => {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      const messageSnap = await getDoc(messageRef);
  
      if (!messageSnap.exists()) return; // Message doesn't exist
  
      const messageData = messageSnap.data();
  
      // ✅ Allow both sender and receiver to delete the message
      if (messageData.senderId === loggedInUser.uid || messageData.receiverId === loggedInUser.uid) {
        if (messageData.isDeleted) {
          // ✅ If already marked as deleted, remove permanently
          await deleteDoc(messageRef);
        } else {
          // ❌ Otherwise, mark it as deleted
          await updateDoc(messageRef, {
            text: "This message was deleted",
            isDeleted: true,
          });
        }
      } else {
        console.warn("You are not allowed to delete this message.");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  

  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return "Offline";

    const date = lastSeenDate.toDate ? lastSeenDate.toDate() : new Date(lastSeenDate);

    if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, "h:mm a")}`;
    if (differenceInDays(new Date(), date) < 7) return `${format(date, "EEEE")} at ${format(date, "h:mm a")}`;

    return `${format(date, "MMM d, yyyy")} at ${format(date, "h:mm a")}`;
  };

  return {
    messagesEndRef,
    firstUnseenMessageRef,
    handleSendMessage,
    handleKeyDown,
    startEditing,
    cancelEditing,
    saveEditedMessage,
    deleteMessage,
    markMessagesAsSeen,
    formatLastSeen,
  };
};

export default useChatFunctions;