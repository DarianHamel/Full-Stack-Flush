import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useCookies } from "react-cookie";

const Profile = ({ username }) => {
  const [cookies] = useCookies(["username", "token"]);
  const [balance, setBalance] = useState(0);
  const [wins, setWins] = useState(0);
  const [loses, setLoses] = useState(0);
  const [winLossRatio, setWinLossRatio] = useState(0);

  useEffect(() => {
    if (!cookies.username) return;

    const fetchBalance = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5050/balance?username=${cookies.username}`,
          { withCredentials: true }
        );
        setBalance(data.balance);
      } catch (error) {
        console.error("Error fetching balance: ", error);
      }
    };

    const fetchWins = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5050/getWins?username=${cookies.username}`,
          { withCredentials: true }
        );
        setWins(data.wins); // Fix: Ensure data is properly extracted
      } catch (error) {
        console.error("Error fetching user wins: ", error);
      }
    };

    const fetchLose = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5050/getLosses?username=${cookies.username}`,
          { withCredentials: true }
        );
        setLoses(data.losses); // Fix: Ensure correct field
      } catch (error) {
        console.error("Error fetching user losses: ", error);
      }
    };

    fetchBalance();
    fetchWins();
    fetchLose();
  }, [cookies.username]);

  const handleWin = async () => {
    if (!cookies.username) return;
    try {
      const { data } = await axios.post(
        "http://localhost:5050/updateStats",
        { username: cookies.username, wins: 1, losses: 0 },
        { withCredentials: true}
      );
      setWins(data.wins); // Fix: Update state correctly
    } catch (error) {
      console.error("Error updating wins: ", error);
    }
  };

  const handleLose = async () => {
    if (!cookies.username) return;
    try {
      const { data } = await axios.post(
        "http://localhost:5050/updateStats",
        { username: cookies.username, wins: 0, losses: 1 },
        { withCredentials: true}
      );
      setLoses(data.losses); // Fix: Update state correctly
    } catch (error) {
      console.error("Error updating losses: ", error);
    }
  };

  useEffect(() => {
    if (wins + loses > 0) {
      if (loses > 0) {
        setWinLossRatio((wins / loses).toFixed(2));
      }
      else setWinLossRatio(wins);
    }
  }, [wins, loses]);

  return (
    <div className="profile">
      <h2>User Profile</h2>
      {username ? (
        <>
          <p>Welcome back, <strong>{username}</strong>!</p>
          <p>Your current balance: <strong>${balance}</strong></p>
          <p>Wins: <strong>{wins}</strong></p>
          <p>Losses: <strong>{loses}</strong></p>
          <p>Win/Loss Ratio: <strong>{winLossRatio}</strong></p>
          <button onClick={handleWin}>Win</button>
          <button onClick={handleLose}>Lose</button>
        </>
      ) : (
        <p>Please log in to see your profile.</p>
      )}
    </div>
  );
};

export default Profile;
