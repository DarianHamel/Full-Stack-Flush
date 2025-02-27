import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTrophy, FaBook } from "react-icons/fa"; // Added FaBook icon for tutorials
import Login from "./Login";
import Signup from "./Signup";
import "../design/Navbar.css";

const Navbar = ({ username, setUsername, onLogout }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); 
  const profileButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && 
        !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    navigate("/");  
    onLogout();  
  };

  return (
    <nav className="navbar">
      {/* left: leaderboard & tutorials buttons */}
      <div className="nav-left">
        <button className="leaderboard-button" onClick={() => navigate("/leaderboard")}>
          <FaTrophy size={40} />
        </button>
        <button className="tutorials-button" onClick={() => navigate("/tutorials")}>
          <FaBook size={40} />
        </button>
      </div>

      {/* center: title that navigates to home */}
      <div className="nav-center" onClick={() => navigate("/")}>
        <h1 className="app-title">FULL STACK FLUSH</h1>
      </div>

      {/* right: profile dropdown */}
      <div className="nav-right">
        <div className="profile-menu" ref={dropdownRef}>
          <button 
            className="profile-icon" 
            onClick={() => setShowDropdown(!showDropdown)}>
            <FaUser size={40} />
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              {username ? (
                <>
                  <button onClick={() => navigate("/profile")}>Profile</button>
                  <button onClick={(handleLogout)}>Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setShowLogin(true); setShowDropdown(false); }}>Login</button>
                  <button onClick={() => { setShowSignup(true); setShowDropdown(false); }}>Register</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* login & signup modals */}
      <Login show={showLogin} onClose={() => setShowLogin(false)} setShowSignup={setShowSignup} />
      <Signup show={showSignup} onClose={() => setShowSignup(false)} setShowLogin={setShowLogin} />
    </nav>
  );
};

export default Navbar;
