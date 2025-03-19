import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import "../../design/Profile.css";

const MyProfile = () => {
  const [cookies] = useCookies(["username", "token"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("********");

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
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [cookies.username]);

  return (
    <div className="profile-container">
      <h1 className="profile-label">User Profile</h1>
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
        </tbody>
      </table>
    </div>
  );
};

export default MyProfile;
