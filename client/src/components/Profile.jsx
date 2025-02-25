import React, { useState } from 'react';
import axios from 'axios';
import "../design/Profile.css";

// icons
import { FaUser, FaWallet, FaCog, FaChartBar, FaHeadset, FaSignOutAlt } from 'react-icons/fa';

const Profile = ({ username }) => {
  const [currentPanel, setCurrentPanel] = useState('');

  // load right panel based on panel
  const loadPanelData = (panel) => {
    axios.get(`/api/${panel}`)
      .then(response => {
        console.log(response.data);
        setCurrentPanel(panel);
      })
      .catch(error => console.error('Error fetching data', error));
  };

  return (
    <div className="left-panel">
      {/* Left Panel -- username and panel options */}
      <div>
        <h2>@{username}</h2>
        <div>
          <button onClick={() => loadPanelData('profile')}><FaUser /> My Profile</button>
          <button onClick={() => loadPanelData('balance')}><FaWallet /> Balance</button>
          <button onClick={() => loadPanelData('settings')}><FaCog /> Settings</button>
          <button onClick={() => loadPanelData('stats')}><FaChartBar /> Stats</button>
          <button onClick={() => loadPanelData('support')}><FaHeadset /> Support</button>
          <button onClick={() => loadPanelData('logout')}><FaSignOutAlt /> Logout</button>
        </div>
      </div>

      {/* Right Panel -- options */}
      <div className="right-panel">
        <h3>{currentPanel ? `Showing ${currentPanel} panel` : 'Select a panel'}</h3>
        <div>
          {currentPanel === 'profile' && <p>Your profile details here</p>}
          {currentPanel === 'balance' && <p>Your balance details here</p>}
          {currentPanel === 'settings' && <p>Settings panel</p>}
          {currentPanel === 'stats' && <p>Stats panel</p>}
          {currentPanel === 'support' && <p>Support panel</p>}
          {currentPanel === 'logout' && <p>Logout panel</p>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
