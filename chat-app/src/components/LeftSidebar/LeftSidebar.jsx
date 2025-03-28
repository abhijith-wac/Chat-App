import React from "react";

const LeftSidebar = () => {
  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu" />
          </div>
        </div>
        <div className="ls-search">
          <input type="text" placeholder="Search here..." />
        </div>
      </div>
      <div className="ls-list">
        {Array(12).fill("").mapmap((item, index)=>(
          <div key={index} className="friends">
            <div className="friends-icon">
              <img src={assets.user} alt="User" />
            </div>
            <div>
              <p>John Doe</p>
              <span>Online</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
