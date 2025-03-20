import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../design/Tutorial.css";

const TutorialDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const API_BASE_URL = "http://localhost:5050/api/tutorials"; 

  useEffect(() => {

    const loadTutorial = async () => {
      try {
        console.log(id);
        const response = await axios.get(`${API_BASE_URL}?id=${id}`);
        setTutorial(response.data.tutorials);
      } catch (error) {
        console.error("Error fetching tutorial:", error);
      }
    };
    loadTutorial();
  }, [id]);

  if (!tutorial) return <p className="text-center mt-6">Loading tutorial...</p>;

  return (
    <div className="tutorial-details-container">
      <h1 className="tutorial-details-heading">{tutorial.title}</h1>
      <p className="tutorial-details-content">{tutorial.content}</p>
      <div className="tutorial-details-actions">
        <a
          href={tutorial.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="tutorial-watch-video"
        >
          Watch Video
        </a>
      </div>
    </div>
  );
};

export default TutorialDetails;
