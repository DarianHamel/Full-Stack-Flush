import { useState } from "react";
import { createTutorial } from "../api";

const TutorialModal = ({ onClose, onTutorialAdded }) => {
  const [formData, setFormData] = useState({
    game: "",
    title: "",
    content: "",
    difficulty: "",
    video_url: "",
    createdAt: new Date().toISOString(),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTutorial(formData);
      onTutorialAdded(); // Refresh tutorial list
      onClose(); // Close modal
    } catch (error) {
      console.error("Error creating tutorial:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Add New Tutorial</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="game" placeholder="Game" onChange={handleChange} required className="border p-2 w-full" />
          <input type="text" name="title" placeholder="Title" onChange={handleChange} required className="border p-2 w-full" />
          <textarea name="content" placeholder="Content" onChange={handleChange} required className="border p-2 w-full"></textarea>
          <input type="text" name="difficulty" placeholder="Difficulty" onChange={handleChange} required className="border p-2 w-full" />
          <input type="text" name="video_url" placeholder="Video URL" onChange={handleChange} required className="border p-2 w-full" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorialModal;
