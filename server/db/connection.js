const { MongoClient, ServerApiVersion } = require("mongodb");

const URI = process.env.ATLAS_URI || "";
const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db; // Store database instance

const connectDB = async () => {
  try {
    // Connect to MongoDB
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");

    db = client.db("employees"); // Assign the database instance
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
};

// Function to get the database instance
const getDB = () => {
  if (!db) {
    throw new Error("❌ Database not initialized. Call connectDB first.");
  }
  return db;
};

module.exports = { connectDB, getDB };
