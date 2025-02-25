import { useEffect, useState, useRef } from "react";
import { useNavigate , Link} from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Login from "./Login";
import Signup from "./Signup";
import "../design/Home.css";
import GamblingReminders from "./GamblingReminders";

const Home = ({ setUsername }) => {
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["token"]);
  const [username, localSetUsername] = useState(""); // Username should be fetched when logged in
  const [amount, setAmount] = useState(""); // Amount for deposit or bet

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const hasCheckedCookie = useRef(false);

  
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
