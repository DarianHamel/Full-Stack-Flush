import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Login from "./Login";
import Signup from "./Signup";

const Home = ({ setUsername }) => {
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["token"]);
  const [username, localSetUsername] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const hasCheckedCookie = useRef(false);
  useEffect(() => {
    // only check the cookie once so it isnt spammed
    if (hasCheckedCookie.current) return;
    hasCheckedCookie.current = true;

    if (username) setShowLogin(false);

    const verifyCookie = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:5050",
          {},
          { withCredentials: true }
        );
        const { status, user } = data;
        if (status) {
          localSetUsername(data.user);
          setUsername(data.user);
          toast(`Hello ${user}`, { position: "bottom-right" });
        } else {
          removeCookie("token");
          // Optionally show a toast message or redirect
          toast.error("Session expired. Please log in.", { position: "bottom-right" });
        }
      } catch (error) {
        console.error("Verification failed:", error);
        removeCookie("token");
        toast.error("An error occurred. Please log in.", { position: "bottom-right" });
      }
    };
  
    verifyCookie();
  }, [cookies, navigate, removeCookie, setUsername, username]);
  const Logout = () => {
    removeCookie("token");
    removeCookie("username");
    localSetUsername("");
    setUsername("");
    window.location.reload();
  };
  // next agenda for mateo: clean up the cookie verification stuff bc its duplicated in here and in app.jsx now
  // also fix refreshing stuff and when registering it doesnt close and auto-refresh when it should
  // fix this home.jsx and start connecting stuff to other features now
  // potentially connect to leaderboard now and start making sure user stats work too, display them on profile page too
  return (
    <>
      <div className="home_page">
        {username && (
          <>
            <h4>
            {" "}
            Hello, <span>{username}</span>
            </h4>
            <button onClick={Logout}>LOGOUT</button>
          </>
        )}

        <h4>Welcome to Full Stack Flush!</h4>
        {!username && (
          <>
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowSignup(true)}>Register</button>
          </>
        )}
      </div>

      <Login show={showLogin} onClose={() => setShowLogin(false)} setShowSignup={setShowSignup}/>
      <Signup show={showSignup} onClose={() => setShowSignup(false)} setShowLogin={setShowLogin}/>
      <ToastContainer />
    </>
  );
};

export default Home;