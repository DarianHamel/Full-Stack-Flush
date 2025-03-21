import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import "../../design/profile/History.css";

const History = () => {
  const [cookies] = useCookies(["username", "token"]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!cookies.username) return;

    const getHistory = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5050/getHistory?username=${cookies.username}`,
          { withCredentials: true }
        );
        setHistory(data);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      }
    };

    getHistory();
  }, [cookies.username]);

  return (
    <div className="history-container">
      <p className="title">Transaction History</p>
      <div className="history-list">
        {history.length === 0 ? (
          <p className="no-history">No transaction history found.</p>
        ) : (
          history.map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-info">
                <p className="game-name">{item.game}</p>
                <p className="date">{new Date(item.day).toLocaleString()}</p>
              </div>
              <p className="transaction-number">${item.transaction}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
