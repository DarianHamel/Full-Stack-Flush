import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import "../../design/profile/Stats.css";

const MyProfile = () => {
  const [cookies] = useCookies(["username", "token"]);
  const [moneySpent, setMoneySpent] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    if (!cookies.username) return;

    const fetchUserStats = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5050/GetStats?username=${cookies.username}`,
          { withCredentials: true }
        );
        setMoneySpent(data.moneySpent);
        setTimeSpent(Math.floor(data.timeSpent/60)); // In Minutes
        setWins(data.wins);
        setLosses(data.losses);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };
    fetchUserStats();
  }, [cookies.username]);

  useEffect(() => {
    if (wins + losses > 0) {
      setRatio((wins / (wins + losses)));
    }
  }, [wins, losses]);

  return (
    <div className="profile-container">
      <h1 className="profile-label">User Stats</h1>
      <table className="profile-table">
        <tbody>
          <tr>
            <td>Money Spent</td>
            <td>${moneySpent}</td>
          </tr>
          <tr>
            <td>Time Spent</td>
            <td>{timeSpent} Minutes</td> 
          </tr>
          <tr>
            <td>Wins</td>
            <td>{wins}</td>
          </tr>
          <tr>
            <td>Losses</td>
            <td>{losses}</td>
          </tr>
          <tr>
            <td>Win/Loss Ratio</td>
            <td>{ratio.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MyProfile;
