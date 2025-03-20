import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "../design/Tutorial.css";

const TutorialPage = () => {
  const [tutorials, setTutorials] = useState([]);
  const navigate = useNavigate(); // Initialize navigation
  const API_BASE_URL = "http://localhost:5050/api/tutorials"; 

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setTutorials(response.data.tutorials);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
    }
  };

  return (
    <div className="tutorials-container">
      <h1 className="tutorials-heading">Game Tutorials</h1>
      <div className="tutorials-list">
        {tutorials.map((tutorial) => (
          <Link key={tutorial._id} to={`/tutorial/${tutorial._id}`} className="tutorial-link">
            {tutorial.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TutorialPage;
