import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import "../navbar.css";
import "../index.css"

const Navbar = ({ username, setUsername, onLogout }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  const profileClick = () => {
    navigate("/profile");
  }

  const homeClick = () => {
    navigate("/");
  }

  return (
    <nav className="navbar">

      <div className="nav-left">
        <button className="home-btn" onClick={homeClick}>Home</button>
      </div>

      <div className="nav-right">
        {username ? (
          <div className="user-actions">
            <span className="username">Hello, {username}</span>
            <button className="profile-btn" onClick={profileClick}>Profile</button>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="login-btn" onClick={() => setShowLogin(true)}>Login</button>
            <button className="signup-btn" onClick={() => setShowSignup(true)}>Register</button>
          </div>
        )}
      </div>
      
      <Login show={showLogin} onClose={() => setShowLogin(false)} setShowSignup={setShowSignup}/>
      <Signup show={showSignup} onClose={() => setShowSignup(false)} setShowLogin={setShowLogin}/>
    </nav>
  );
};

export default Navbar;
