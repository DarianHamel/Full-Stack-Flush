import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import "../../design/profile/Balance.css";

const Balance = () => {
  // all the parameters we need in this page
  const [cookies] = useCookies(["username", "token"]);
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  /*
  Get the balance on launch of page
  Sets it in balance const
  */
  useEffect(() => {
    if (!cookies.username) return;

    const getBalance = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5050/balance?username=${cookies.username}`,
          { withCredentials: true }
        );
        setBalance(data.balance);
      } catch (error) {
        console.error("Error fetching user's balance:", error);
      }
    };

    getBalance();
  }, [cookies.username]);

  /*
  Allows the user to deposit if the input values are "valid"
  If the user is valid, updates the amount deposited into the account and updates balance
  */
  const handleDeposit = async () => {
    setError(""); 

    const amount = parseFloat(depositAmount);

    if (!depositAmount || !cardNumber || !expirationDate || !confirmationNumber || !password) { //Fake validation checking
      setError("All fields are required.");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setError("Deposit amount must be a positive number.");
      return;
    }

    try { 
      const { data } = await axios.post(
        "http://localhost:5050/update-balance",
        {
          username: cookies.username,
          amount: parseFloat(depositAmount),
          password: password,  // for "safe gambling", users have to punch in their password
        },
        { withCredentials: true }
      );

      // data should return a balance and a success=true if deposit is successful
      if (data.success) {
        setBalance(data.balance);
        setDepositAmount("");
        setCardNumber("");
        setExpirationDate("");
        setConfirmationNumber("");
        setPassword("");
      } else {
        setError("Incorrect password or transaction failed.");
      }
    } catch (error) {
      setError("Transaction failed. Please try again.");
    }
  };

  return (
    <div className="deposit-container">
      <p className="title">Current Balance: <strong>${balance}</strong></p>

      <div className="deposit-form">
        <p>Deposit Funds</p>
        {error && <p className="error">{error}</p>}

        <input className="deposit"
          type="number"
          placeholder="Enter deposit amount"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <input
          type="text"
          placeholder="Expiration Date (MM/YY)"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Confirmation Number"
          value={confirmationNumber}
          onChange={(e) => setConfirmationNumber(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleDeposit}>Confirm Deposit</button>
      </div>
    </div>
  );
};

export default Balance;
