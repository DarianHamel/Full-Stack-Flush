import { MongoClient } from "mongodb";

const URI = process.env.ATLAS_URI || "";

const client = new MongoClient(URI);

let db;

export const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("FullStackFlush"); 
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("❌ Database not initialized. Call connectDB() first.");
  }
  return db;
};
