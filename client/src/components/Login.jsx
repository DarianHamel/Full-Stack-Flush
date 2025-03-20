import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../design/Login.css";

const Login = ({ show, onClose, setShowSignup }) => {
  if (!show) return null;

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    username: "",
    password: "",
  });

  const { username, password } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-left",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5050/login",
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        onClose();
        setTimeout(() => {
          navigate("/");
          window.location.reload(); 
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      username: "",
      password: "",
    });
  };

  return (
    <div className="modal">
      <div className="modal_content">
        <h1 className="app_name">Full Stack Flush</h1>
        <h2 className="modal_text">Login to your account</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal_information">
            <label htmlFor="username">Username:</label>
            <input
              type="username"
              name="username"
              value={username}
              placeholder="Enter your username"
              onChange={handleOnChange}
            />
          </div>
          <div className="modal_information">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
            />
          </div>
          <div className="button-container">
            <button type="submit" className="submit-button">Submit</button>
            <button type="button" className="close-button" onClick={onClose}>Close</button>
          </div>
            <div className="modal_end">Don't have an account yet?
            <button type="button" className="regis-button" onClick={() => { onClose(); setShowSignup(true); }}>Register</button>
          </div> 
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;