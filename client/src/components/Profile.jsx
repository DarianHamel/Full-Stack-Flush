import React, { useState } from "react";
import "../design/Profile.css";
import AuthRedirect from "./AuthRedirect";

// icons
import { FaUser, FaWallet, FaChartBar, FaHeadset, FaHistory } from "react-icons/fa";

// import Panel Components
import ProfilePanel from "./profile/MyProfile";
import BalancePanel from "./profile/Balance";
import StatsPanel from "./profile/Stats";
import SupportPanel from "./profile/Support";
import HistoryPanel from "./profile/History";

const Profile = ({ username }) => {
  const [currentPanel, setCurrentPanel] = useState("profile"); //Default to profile

  const panelComponents = {
    profile: <ProfilePanel />,
    balance: <BalancePanel />,
    stats: <StatsPanel />,
    support: <SupportPanel />,
    history: <HistoryPanel />,
  };

  const loadPanelData = (panel) => {
    setCurrentPanel(panel);
  };

  return (
    <AuthRedirect username={username}>
      <div className="left-panel">
        {/* Left Panel */}
        <div>
          <h2>@{username}</h2>
          <div>
            <button className="profile-button" onClick={() => loadPanelData("profile")}>
              <FaUser /> My Profile
            </button>
            <button className="profile-button" onClick={() => loadPanelData("balance")}>
              <FaWallet /> Balance
            </button>
            <button className="profile-button" onClick={() => loadPanelData("stats")}>
              <FaChartBar /> Stats
            </button>
            <button className="profile-button" onClick={() => loadPanelData("support")}>
              <FaHeadset /> Support
            </button>
            <button className="profile-button" onClick={() => loadPanelData("history")}>
              <FaHistory /> History
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div>{panelComponents[currentPanel]}</div>
        </div>
      </div>
    </AuthRedirect>
  );
};

export default Profile;
