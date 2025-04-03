import React from 'react';
import { FaComments, FaRocket, FaMobileAlt, FaLock } from 'react-icons/fa';
import '../styles/home.css';

const Home = () => {

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
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