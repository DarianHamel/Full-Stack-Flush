import { useEffect, useState } from "react";
import { fetchTutorials } from "../api";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

const TutorialPage = () => {
  const [tutorials, setTutorials] = useState([]);
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      const data = await fetchTutorials();
      setTutorials(data);
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
      <div className="add-tutorial-button-container">
        {/* Fix: Navigate instead of opening a modal */}
        <button onClick={() => navigate("/tutorials/add")} className="add-tutorial-button">
          Add New Tutorial
        </button>
      </div>
    </div>
  );
};

export default TutorialPage;
