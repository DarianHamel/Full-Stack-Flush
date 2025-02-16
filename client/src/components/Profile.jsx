// temp page for testing
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useCookies } from "react-cookie";

const Profile = ({ username }) => {
  const [cookies] = useCookies(["username"]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!cookies.username) return;
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
    fetchBalance();
  }, [cookies.username]);

  return (
    <div className="profile">
      <h2>User Profile</h2>
      {username ? (
        <>
          <p>Welcome back, <strong>{username}</strong>!</p>
          <p>Your current balance: <strong>${balance}</strong></p>
        </>
      ) : (
        <p>Please log in to see your profile.</p>
      )}
    </div>
  );
};

export default Profile;
