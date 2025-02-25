const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { handle_web_socket } = require("./routes/Blackjack.js");
const expressWs = require("express-ws");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoute = require("./routes/AuthRoute");
const balanceRoute = require("./routes/BalanceRoute");
const winloseRoute = require("./routes/WinLoseRoute");
const leaderboardRoute = require("./routes/LeaderboardRoute");
const tutorialRoutes = require("./routes/tutorial.routes.js");
const { connectDB } = require("./db/connection.js");

const { ATLAS_URI, PORT } = process.env;
const app = express();
expressWs(app);

// Connect to MongoDB
connectDB().then(() => {
  console.log("MongoDB connected successfully");

  // Middleware
  app.use(
    cors({
      origin: ["http://localhost:5173"],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Routes
  app.use("/", authRoute);
  app.use("/", balanceRoute);
  app.use("/", winloseRoute);
  app.use("/", leaderboardRoute);
  app.use("/api/tutorials", tutorialRoutes); // Integrate tutorial routes

  // WebSocket handling
  app.ws("/", (ws, req) => {
    console.log(req.headers.cookie);
    let cookie = req.headers.cookie;
    let match = cookie.match(/username=\s*([\w\d_]+)/);
    console.log(match[1]);
    handle_web_socket(ws);
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Failed to connect to DB:", err);
});