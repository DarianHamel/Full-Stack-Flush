import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Leaderboard from "./components/Leaderboard";
import Blackjack from "./components/Blackjack";
import Navbar from "./components/Navbar";
import Resources from "./components/Resources";
import AboutUs from "./components/AboutUs";
import Poker from "./components/Poker";
import TutorialPage from "./components/TutorialPage";  // Added
import TutorialDetails from "./components/TutorialDetails"; // Added

import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

const App = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (cookies.username) {
      setUsername(cookies.username);
    } else {
      const verifyCookie = async () => {
        try {
          const { data } = await axios.post(
            "http://localhost:5050",
            {},
            { withCredentials: true }
          );
          const { status, user } = data;
          if (status) {
            setUsername(user);
            setCookie("username", user);
          } else {
            removeCookie("token");
            removeCookie("username");
            setUsername("");
          }
        } catch (error) {
          console.error("Verification failed:", error);
          removeCookie("token");
          removeCookie("username");
          setUsername("");
        }
      };
      verifyCookie();
    }
  }, [cookies, setCookie, removeCookie]);

  return (
    <div className="App">
      <Navbar
        className="navbar"
        username={username}
        onLogout={() => {
          removeCookie("token");
          removeCookie("username");
          setUsername("");
          window.location.reload();
        }}
      />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home username={username} setUsername={setUsername} />} />
          <Route path="/profile" element={<Profile username={username} />} />
          <Route path="/leaderboard" element={<Leaderboard username={username} />} />
          <Route path="/blackjack" element={<Blackjack username={username} />} />
          
          {/* Tutorial Routes */}
          <Route path="/tutorials" element={<TutorialPage username={username} />} />
          <Route path="/tutorial/:id" element={<TutorialDetails />} />
        <Route path="/poker" element={<Poker username={username} />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/about-us" element={<AboutUs />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
