import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTutorialById, deleteTutorialById } from "../api"; // Import delete function

const TutorialDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);

  useEffect(() => {
    const loadTutorial = async () => {
      try {
        const data = await fetchTutorialById(id);
        setTutorial(data);
      } catch (error) {
        console.error("Error fetching tutorial:", error);
      }
    };
    loadTutorial();
  }, [id]);

  // Function to handle deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this tutorial?");
    if (confirmDelete) {
      try {
        await deleteTutorialById(id);
        navigate("/tutorials"); // Redirect to tutorial list after deleting
      } catch (error) {
        console.error("Error deleting tutorial:", error);
      }
    }
  };

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
        <button onClick={handleDelete} className="tutorial-delete-button">
          Delete Tutorial
        </button>
      </div>
    </div>
  );
};

export default TutorialDetails;
