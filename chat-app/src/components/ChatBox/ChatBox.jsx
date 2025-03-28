import React from 'react';
import './ChatBox.css';
import assets from '../../assets/assets'; // Ensure this path is correct

const ChatBox = () => {
  return (
    <div className="chat-box">
      <div className="chat-user">
        <img src={assets.profile_img} alt="User profile" />
        <p>
          Richard Sanford <img src={assets.green_dot} alt="Online status" />
        </p>
        <img src={assets.help_icon} className="help" alt="Help icon" />
      </div>
    </div>
  );
};

export default ChatBox;
