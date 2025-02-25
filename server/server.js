const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
import records from "./routes/record.js";
//import blackjack from "./routes/Blackjack.js";
import { handle_web_socket } from "./routes/Blackjack.js"; //Should probably move it out of ./routes now
import expressWs from "express-ws";

const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser"); // for managing cookie-based sessions and extracting data from cookies

const authRoute = require("./routes/AuthRoute");
const balanceRoute = require("./routes/BalanceRoute");
const winloseRoute = require("./routes/WinLoseRoute");
const leaderboardRoute = require("./routes/LeaderboardRoute");
const { ATLAS_URI, PORT } = process.env;

mongoose
  .connect(ATLAS_URI)
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => console.error(err));


//app.use("/api/blackjack", blackjack);


expressWs(app);

app.ws('/', (ws, req) => {
  //Pass the websocket to blackjack.js to deal with
  handle_web_socket(ws);
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/", authRoute);
app.use("/", balanceRoute);
app.use("/", winloseRoute);
app.use("/", leaderboardRoute);