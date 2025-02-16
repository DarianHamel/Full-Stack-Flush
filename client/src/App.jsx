import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Profile from "./components/Profile";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

const App = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [username, setUsername] = useState("");

  // this is here now for global username cookie checking
  // will eventually get rid of it in Home.jsx
  // this allows cookie to be tracked globally and not just per page like it was
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
            setCookie('username', user);
          } else {
            removeCookie("token");
            removeCookie("username");
            setUsername('');
          }
        } catch (error) {
          console.error("Verification failed:", error);
          removeCookie("token");
          removeCookie("username");
          setUsername('');
        }
      };
      verifyCookie();
    }
  }, [cookies, setCookie, removeCookie]);


  return (
    <div className="App">
      <Navbar className ="navbar" username={username} onLogout={() => {
        removeCookie("token");
        removeCookie("username")
        setUsername("");
        window.location.reload();
      }}/>
      <Routes>
        <Route path="/" element={<Home username={username} setUsername={setUsername}/>} />
        <Route path="/profile" element={<Profile username={username}/>} />
      </Routes>
    </div>
  );
};
export default App;
