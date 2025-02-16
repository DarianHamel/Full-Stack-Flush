import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";

const Balance = () => {
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies([]);
  const [username, setUsername] = useState(""); // Username should be fetched when logged in
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const verifyCookie = async () => {
      if (!cookies.token) {
        navigate("/login");
      }
      const { data } = await axios.post(
        "http://localhost:5050",
        {},
        { withCredentials: true }
      );
      const { status, user } = data;
      setUsername(user);
      fetchBalance(user);
      return status
        ? null
        : (removeCookie("token"), navigate("/login"));
    };
    verifyCookie();
  }, [cookies, navigate, removeCookie]);

  const fetchBalance = async (username) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5050/balance", // Fetch balance for logged-in user
        { username },
        { withCredentials: true }
      );
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance", error);
    }
  };

  return (
    <div className="balance_page">
      <h4>Welcome, <span>{username}</span></h4>
      <h5>Your current balance is: ${balance}</h5>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default Balance;
