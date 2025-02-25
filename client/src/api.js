import axios from "axios";

const API_BASE_URL = "http://localhost:5050/api/tutorials"; 

export const fetchTutorials = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data.tutorials;
};

export const fetchTutorialById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data.tutorial;
};

export const createTutorial = async (tutorialData) => {
  const response = await axios.post(API_BASE_URL, tutorialData);
  return response.data;
};

export const deleteTutorial = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const deleteTutorialById = async (id) => {
  const response = await fetch(`http://localhost:5050/api/tutorials/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete tutorial");
};
