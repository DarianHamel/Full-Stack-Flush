import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Login from "./Login";
import Signup from "./Signup";
import "../design/Home.css";

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
      
    </>
  );
};

export default Home;
