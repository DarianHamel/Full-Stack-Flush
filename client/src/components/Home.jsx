import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import '../design/Home.css';
import GamblingReminders from './GamblingReminders';

const Home = () => {
  return (
    <>
      <div className="home_page">
        <div className="card-container">
          <Link to="/blackjack" className="card">
            <h3>Blackjack</h3>
          </Link>
          <Link to="/poker" className="card">
            <h3>Poker</h3>
          </Link>
          <Link to="/tutorials" className="card">
            <h3>Tutorials</h3>
          </Link>
          <Link to="/leaderboard" className="card">
            <h3>Leaderboard</h3>
          </Link>
          <Link to="/resources" className="card">
            <h3>Resources</h3>
          </Link>
          <Link to="/about-us" className="card">
            <h3>About Us</h3>
          </Link>
        </div>
      </div>
      <GamblingReminders />
      <ToastContainer />
    </>
  );
};

export default Home;
