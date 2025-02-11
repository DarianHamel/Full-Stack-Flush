import express from "express";
import cors from "cors";
import { connectDB, getDB } from "./db/connection.js";
import tutorialRoutes from "./routes/tutorial.routes.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// Connect to DB first, then start the server
connectDB().then(() => {
  app.use("/api/tutorials", tutorialRoutes); // Use routes after DB connection
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error("❌ Failed to connect to DB:", err);
});
