import { useEffect, useState, useRef } from "react";
import { useNavigate , Link} from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
//import { ToastContainer, toast } from "react-toastify";
import Login from "./Login";
import Signup from "./Signup";
import "../design/Home.css";
//import GamblingReminders from "./GamblingReminders";
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import GamblingReminders from './GamblingReminders';


const Home = () => {
  return (
    <>
      <div className="home_page">
        <div className="card-container">
          <div className="card-wrapper">
            <Link to="/blackjack" className="card">
              <h3>Blackjack</h3>
            </Link>
          </div>
          <div className="card-wrapper">
            <Link to="/poker" className="card">
              <h3>Poker</h3>
            </Link>
            </div>
          <div className="card-wrapper">
            <Link to="/tutorials" className="card">
              <h3>Tutorials</h3>
            </Link>
            </div>
          <div className="card-wrapper">
            <Link to="/leaderboard" className="card">
              <h3>Leaderboard</h3>
            </Link>
            </div>
          <div className="card-wrapper">
            <Link to="/resources" className="card">
              <h3>Resources</h3>
            </Link>
            </div>
          <div className="card-wrapper">
            <Link to="/about-us" className="card">
              <h3>About Us</h3>
            </Link>
          </div>
        </div>
      </div>  
    </>
  );
};

export default Home;
