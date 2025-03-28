import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "../design/Tutorial.css";

const TutorialPage = ({ username }) => {
  const [tutorials, setTutorials] = useState([]);
  const [viewedIDs, setViewedIDs] = useState([]);
  const navigate = useNavigate(); // Initialize navigation
  const API_BASE_URL = "http://localhost:5050/api/tutorials"; 
  const USER_TUTORIALS_URL = `http://localhost:5050/api/user-tutorials/${username}`;

  /*
  Load the tutorials on page launch
  */
  useEffect(() => {
    loadTutorials();
    loadUserTutorials();
  }, []);

  /*
  Load the tutorials
  Calls route /api/tutorials
  Returns the list of tutorials
  */
  const loadTutorials = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setTutorials(response.data.tutorials);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
    }
  };

  /*
  Gets the tracking of user tutorial completion
  */
  const loadUserTutorials = async () => {
    try {
      const response = await axios.get(USER_TUTORIALS_URL);
      if(response.data){
        console.log(response);
        let tutsViewed = response.data.tutorialsViewed;
        const viewedIDs = [];
        tutsViewed.forEach(tutorial =>{
          viewedIDs.push(tutorial._id)
        });
        setViewedIDs(viewedIDs);
      }
    } catch (error) {
      console.error("Error fetching user tutorials:", error);
    }
  };

  /*
  Mark the input tutorial as viewed
  */
  const markTutorialAsViewed = async (tutorialId) => {
    try {
      await axios.post(USER_TUTORIALS_URL, { tutorialId });
      loadUserTutorials(); // Refresh the viewed tutorials
    } catch (error) {
      console.error("Error marking tutorial as viewed:", error);
    }
  };

  return (
    <div className="tutorials-container">
      <h1 className="tutorials-heading">Game Tutorials</h1>
      <div className="tutorials-list">
        {tutorials.map((tutorial) => (
          <div key={tutorial._id} className="tutorial-item">
            <Link
              to={`/tutorial/${tutorial._id}`}
              className="tutorial-link"
              onClick={() => markTutorialAsViewed(tutorial._id)}
            >
              {tutorial.title}
            </Link>
            {viewedIDs.includes(tutorial._id.toString()) && (
              <span className="viewed-indicator"> ✔</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorialPage;
