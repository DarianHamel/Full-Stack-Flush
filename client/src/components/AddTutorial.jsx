import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTutorial } from "../api";
import "../index.css"; // Import global styles

const AddTutorial = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    game: "",
    title: "",
    content: "",
    difficulty: "",
    video_url: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTutorial(formData);
      navigate("/tutorials"); // Redirect to tutorials list
    } catch (error) {
      console.error("Error creating tutorial:", error);
    }
  };

  return (
    <div className="add-tutorial-container">
      <h2 className="add-tutorial-heading">Create New Tutorial</h2>
      <form onSubmit={handleSubmit} className="add-tutorial-form">
        <input type="text" name="game" placeholder="Game" onChange={handleChange} required />
        <input type="text" name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="content" placeholder="Content" onChange={handleChange} required></textarea>
        <input type="text" name="difficulty" placeholder="Difficulty" onChange={handleChange} required />
        <input type="text" name="video_url" placeholder="Video URL" onChange={handleChange} required />
        <div className="add-tutorial-buttons">
          <button type="button" onClick={() => navigate("/tutorials")} className="cancel-button">Cancel</button>
          <button type="submit" className="submit-button">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AddTutorial;
