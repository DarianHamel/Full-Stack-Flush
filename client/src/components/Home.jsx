import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies([]);
  const [username, setUsername] = useState(""); // Username should be fetched when logged in
  const [amount, setAmount] = useState(""); // Amount for deposit or bet

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
      return status
        ? toast(`Hello ${user}`, {
            position: "top-right",
          })
        : (removeCookie("token"), navigate("/login"));
    };
    verifyCookie();
  }, [cookies, navigate, removeCookie]);

  // Update balance (deposit or bet)
  const updateBalance = async (username, change) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount!");
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:5050/update-balance",
        { username, amount: change }, // Pass username and amount
        { withCredentials: true }
      );
      toast.success(`Balance updated: $${data.balance}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Transaction failed");
    }
  };

  return (
    <>
      <div className="home_page">
        <h4>Welcome, <span>{username}</span></h4>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <button onClick={() => updateBalance(username, -Number(amount))}>Bet</button>
        <button onClick={() => updateBalance(username, Number(amount))}>Deposit</button>
        <button onClick={() => { removeCookie("token"); navigate("/login"); }}>LOGOUT</button>
        <button onClick={() => navigate("/balance")}>View Balance</button>
      </div>
      <ToastContainer />
    </>
  );
};

export default Home;
