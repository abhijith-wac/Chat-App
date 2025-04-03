import { useRef, useState, useEffect } from "react";
import { useAtom } from "jotai";
import { 
  messagesAtom, textAtom, emojiPickerAtom, selectedMessageAtom, 
  editingMessageAtom, editTextAtom 
} from "../atoms/chatAtom";
import { 
  collection, query, orderBy, onSnapshot, updateDoc, doc, getDoc,
  setDoc, addDoc, serverTimestamp, deleteDoc
} from "firebase/firestore";
import { db } from "../services/config";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

const useChatFunctions = (chatId, loggedInUser, userId) => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [text, setText] = useAtom(textAtom);
  const [showEmojiPicker, setShowEmojiPicker] = useAtom(emojiPickerAtom);
  const [selectedMessage, setSelectedMessage] = useAtom(selectedMessageAtom);
  const [editingMessageId, setEditingMessageId] = useAtom(editingMessageAtom);
  const [editText, setEditText] = useAtom(editTextAtom);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // New state for typing

  const messagesEndRef = useRef(null);
  const firstUnseenMessageRef = useRef(null);
  
  useEffect(() => {
    if (!chatId || !loggedInUser) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const chatRef = doc(db, "chats", chatId);

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(newMessages);
      updateMessageStatus(newMessages);
    });

    const unsubscribeChat = onSnapshot(chatRef, (doc) => {
      const data = doc.data();
      if (data?.typing) {
        setIsOtherUserTyping(!!data.typing[userId] && userId !== loggedInUser.uid);
      } else {
        setIsOtherUserTyping(false);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeChat();
    };
  }, [chatId, loggedInUser, setMessages, userId]);

  const updateMessageStatus = async (msgs) => {
    if (!msgs?.length || !loggedInUser) return;

    const updates = msgs
      .filter(msg => msg.receiverId === loggedInUser.uid && msg.status === "sent")
      .map(msg => updateDoc(doc(db, "chats", chatId, "messages", msg.id), { status: "delivered" }));
    
    if (updates.length) await Promise.all(updates);
  };

  const markMessagesAsSeen = async () => {
    if (!messages?.length || !loggedInUser) return;

    const updates = messages
      .filter(msg => msg.receiverId === loggedInUser.uid && msg.status === "delivered")
      .map(msg => updateDoc(doc(db, "chats", chatId, "messages", msg.id), { status: "seen" }));
    
    if (updates.length) await Promise.all(updates);
  };

  useEffect(() => {
    if (!messages?.length) return;
    
    const hasUnseenMessages = messages.some(
      msg => msg.receiverId === loggedInUser?.uid && msg.status === "delivered"
    );
    
    setTimeout(() => {
      (hasUnseenMessages ? firstUnseenMessageRef : messagesEndRef)
        .current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages, loggedInUser?.uid]);

  const handleSendMessage = async () => {
    if (!text.trim() || !loggedInUser) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, { createdAt: serverTimestamp() }, { merge: true });
      }
      
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: text.trim(),
        senderId: loggedInUser.uid,
        receiverId: userId,
        timestamp: serverTimestamp(),
        status: "sent",
      });
      
      await updateDoc(chatRef, {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
        lastSenderId: loggedInUser.uid,
        [`typing.${loggedInUser.uid}`]: false
      });

      setText("");
      setShowEmojiPicker(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = async (e) => {
    if (!loggedInUser) return;

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, { [`typing.${loggedInUser.uid}`]: true });

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      editingMessageId ? saveEditedMessage() : handleSendMessage();
    }
  };

  const handleKeyUp = async () => {
    if (!loggedInUser) return;
    const chatRef = doc(db, "chats", chatId);
    setTimeout(async () => {
      await updateDoc(chatRef, { [`typing.${loggedInUser.uid}`]: false });
    }, 1000);
  };

  const handleBlur = async () => {
    if (!loggedInUser) return;
    await updateDoc(doc(db, "chats", chatId), { [`typing.${loggedInUser.uid}`]: false });
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

    try {
      await updateDoc(doc(db, "chats", chatId, "messages", editingMessageId), {
        text: editText.trim(),
        edited: true,
        editedAt: serverTimestamp(),
      });
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, { [`typing.${loggedInUser.uid}`]: false });
      cancelEditing();
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      const messageSnap = await getDoc(messageRef);
      if (!messageSnap.exists()) return;

      const messageData = messageSnap.data();
      if ([messageData.senderId, messageData.receiverId].includes(loggedInUser.uid)) {
        messageData.isDeleted 
          ? await deleteDoc(messageRef) 
          : await updateDoc(messageRef, { text: "This message was deleted", isDeleted: true });
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
    handleKeyUp,
    handleBlur,
    startEditing, 
    cancelEditing, 
    saveEditedMessage, 
    deleteMessage, 
    markMessagesAsSeen, 
    formatLastSeen,
    isOtherUserTyping // Add typing status to return value
  };
};

export default useChatFunctions;