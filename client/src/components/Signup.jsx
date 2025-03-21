import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../design/Signup.css"

const Signup = ({ show, onClose, setShowLogin }) => {
  if (!show) return null;
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    password: "",
    username: "",
  });
  const { password, username } = inputValue;

  /*
  Handles the user input into the credential fields
  */
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  /*
  Displays the error message in the bottom left
  */
  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
  });

  /*
  Displays the success message in the bottom right
  */
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
  });

  /*
  Handle the user hitting the submit button
  Calls route /signup
  Input: Username and Password
  On success, navigates user to home and reloads the window
  On failure, alert user that it was not successful
  */  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5050/signup",
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          onClose();
          navigate("/");
        }, 500);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      password: "",
      username: "",
    });
  };

  return (
    <div className="modal">
      <div className="modal_content">
        <h1 className="app_name">Full Stack Flush</h1>
        <h2 className="modal_text">Register Now!</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal_information">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
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
          <div>
            <div className="modal_end">Already have an account?
              <button type="button" className="regis-button" onClick={() => { onClose(); setShowLogin(true); }}>Login</button>
            </div> 
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;