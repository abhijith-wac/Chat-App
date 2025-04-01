import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaRocket, FaMobileAlt, FaLock } from 'react-icons/fa';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="chat-bubbles">
            <div className="bubble bubble-1"> Welcome!</div>
            <div className="bubble bubble-2">💬 Start chatting now</div>
            <div className="bubble bubble-3"> Fast & Secure</div>
          </div>
          <div className="main-hero">
            <h1 className="animated-title">
              Connect &amp; Chat
              <span className="pulse-icon"><FaComments /></span>
            </h1>
            <p className="subtitle">Real-time messaging with end-to-end encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;