import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Login from "./Login";
import Signup from "./Signup";

const Home = () => {
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies([]);
  const [username, setUsername] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  useEffect(() => {
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
          toast(`Hello ${user}`, { position: "top-right" });
        } else {
          removeCookie("token");
          // Optionally show a toast message or redirect
          toast.error("Session expired. Please log in.");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        removeCookie("token");
        toast.error("An error occurred. Please log in.");
      }
    };
  
    verifyCookie();
  }, [cookies, navigate, removeCookie]);
  const Logout = () => {
    removeCookie("token");
    setUsername("");
    window.location.reload();
  };
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