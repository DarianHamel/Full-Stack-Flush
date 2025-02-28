import React, { useState } from "react";
import "../design/Profile.css";

// icons
import { FaUser, FaWallet, FaChartBar, FaHeadset } from "react-icons/fa";

// import Panel Components
import ProfilePanel from "./profile/MyProfile";
import BalancePanel from "./profile/Balance";
import StatsPanel from "./profile/Stats";
import SupportPanel from "./profile/Support";

const Profile = ({ username }) => {
  const [currentPanel, setCurrentPanel] = useState("");

  const panelComponents = {
    profile: <ProfilePanel />,
    balance: <BalancePanel />,
    stats: <StatsPanel />,
    support: <SupportPanel />,
  };

  const loadPanelData = (panel) => {
    if (panel === "logout") {
      console.log("Logging out..."); 
      return;
    }
    if (panelComponents[panel]) {
      setCurrentPanel(panel);
    } else {
      console.error(`Invalid panel: ${panel}`);
    }
  };

  return (
    <div className="left-panel">
      {/* Left Panel */}
      <div>
        <h2>@{username}</h2>
        <div>
          <button onClick={() => loadPanelData("profile")}>
            <FaUser /> My Profile
          </button>
          <button onClick={() => loadPanelData("balance")}>
            <FaWallet /> Balance
          </button>
          <button onClick={() => loadPanelData("stats")}>
            <FaChartBar /> Stats
          </button>
          <button onClick={() => loadPanelData("support")}>
            <FaHeadset /> Support
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div>{panelComponents[currentPanel]}</div>
      </div>
    </div>
  );
};

export default Profile;
