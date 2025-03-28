import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import "../../design/Profile.css";

const MyProfile = () => {
  const [cookies] = useCookies(["username", "token"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("********");
  const [timeLimit, setTimeLimit] = useState(0);
  const [moneyLimit, setMoneyLimit] = useState(0);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [error, setError] = useState("");

  /*
  Gets the user info on page launch
  Sets the username, time limit and money limit
  */
  useEffect(() => {
    if (!cookies.username) return;

    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5050/userInfo?username=${cookies.username}`,
          { withCredentials: true }
        );
        setUsername(data.username);
        setPassword("********");
        setTimeLimit(data.timeLimit / 60);
        setMoneyLimit(data.moneyLimit);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Error fetching user profile.");
      }
    };

    fetchUserProfile();
  }, [cookies.username]);

  /*
  Allows the user to set their time limit
  Calls route /SetTimeLimit
  Input: username and new time limit (newLimit)
  */
  const handleSaveTimeLimit = async () => {
    try {
      var newLimit = timeLimit * 60;
      await axios.post(
        "http://localhost:5050/setTimeLimit",
        { username: cookies.username, timeLimit: newLimit },
        { withCredentials: true }
      );
      setIsEditingTime(false);
    } catch (error) {
      console.error("Error setting time limit:", error);
      setError("Error setting time limit.");
    }
  };

  /*
  Allows the user to set their money limit
  Calls route /SetMoneyLimit
  Input: username and new money limit (moneyLimit)
  */
  const handleSaveMoneyLimit = async () => {
    try {
      await axios.post(
        "http://localhost:5050/setMoneyLimit",
        { username: cookies.username, moneyLimit },
        { withCredentials: true }
      );
      setIsEditingMoney(false);
    } catch (error) {
      console.error("Error setting money limit:", error);
      setError("Error setting money limit.");
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-label">User Profile</h1>
      {error && <p className="error">{error}</p>}
      <table className="profile-table">
        <tbody>
          <tr>
            <td>Username</td>
            <td>{username}</td>
          </tr>
          <tr>
            <td>Password</td>
            <td>{password}</td>
          </tr>
          <tr>
            <td>Time Limit (Minutes)</td>
            <td className="profile-flex-container">
              {isEditingTime ? (
                <>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                  />
                  <div className="button-group">
                    <button className="edit_button" onClick={handleSaveTimeLimit}>Save</button>
                    <button className="edit_button" onClick={() => setIsEditingTime(false)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  {timeLimit}
                  <button className="edit_button" onClick={() => setIsEditingTime(true)}>Edit</button>
                </>
              )}
            </td>
          </tr>
          <tr>
            <td>Money Limit ($)</td>
            <td className="profile-flex-container">
              {isEditingMoney ? (
                <>
                  <input
                    type="number"
                    value={moneyLimit}
                    onChange={(e) => setMoneyLimit(Number(e.target.value))}
                  />
                  <div className="button-group">
                    <button className="edit_button" onClick={handleSaveMoneyLimit}>Save</button>
                    <button className="edit_button" onClick={() => setIsEditingMoney(false)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  {moneyLimit}
                  <button className="edit_button" onClick={() => setIsEditingMoney(true)}>Edit</button>
                </>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MyProfile;
