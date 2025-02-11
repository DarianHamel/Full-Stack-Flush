import { db } from "../db/connection.js";

// Collection reference
const collection = db.collection("tutorials");

// Function to create a tutorial
export const createTutorial = async (tutorialData) => {
  return await collection.insertOne(tutorialData);
};

// Function to fetch tutorials
export const getAllTutorials = async () => {
  return await collection.find({}).toArray();
};

// Function to get a single tutorial by ID
export const getTutorialById = async (id) => {
  return await collection.findOne({ _id: new ObjectId(id) });
};

// Function to update a tutorial
export const updateTutorial = async (id, updates) => {
  return await collection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
};

// Function to delete a tutorial
export const deleteTutorial = async (id) => {
  return await collection.deleteOne({ _id: new ObjectId(id) });
};
