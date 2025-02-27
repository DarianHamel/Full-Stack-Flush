import React from 'react';
import { Link } from 'react-router-dom';
import '../design/Resources.css';

const Resources = () => {
  return (
    <div className="resources_page">
      <h1>Gambling Resources</h1>
      <div className="section">
        <h2>Before You Play</h2>
        <p>Before you start gambling, it's important to consider the following:</p>
        <ul>
          <li>Set a budget and stick to it.</li>
          <li>Understand the rules of the game you're playing.</li>
          <li>Take regular breaks to avoid fatigue.</li>
          <li>Never gamble with money you can't afford to lose.</li>
          <li>Be aware of the signs of gambling addiction and seek help if needed.</li>
        </ul>
      </div>
      <div className="section">
        <h2>Responsible Gambling Tips</h2>
        <ul>
          <li>Gamble for fun, not to make money.</li>
          <li>Set time limits for your gambling sessions.</li>
          <li>Don't chase your losses.</li>
          <li>Balance gambling with other activities.</li>
          <li>Seek support if you feel gambling is becoming a problem.</li>
        </ul>
      </div>
      <div className="section">
        <h2>Help and Support</h2>
        <p>If you or someone you know has a gambling problem, there are resources available to help:</p>
        <ul>
          <li><a href="https://www.responsiblegambling.org" target="_blank" rel="noopener noreferrer">Responsible Gambling Council</a></li>
          <li><a href="https://afm.mb.ca/programs-and-services/gambling/" target="_blank" rel="noopener noreferrer">Manitoba Gambling Addiction</a></li>
          <li><a href="https://www.camh.ca/en/health-info/mental-illness-and-addiction-index/problem-gambling" target="_blank" rel="noopener noreferrer">CAMH Problem Gambling</a></li>
        </ul>
      </div>
      <Link to="/" className="back-to-home">Back to Home</Link>
    </div>
  );
};

export default Resources;