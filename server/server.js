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
const userInfoRoute = require("./routes/ProfileRoute");
const tutorialRoutes = require("./routes/TutorialRoute.js");
const pokerRoute = require("./routes/PokerRoute.js");
const betRoutes = require("./routes/BetRoute.js");

const { ATLAS_URI , PORT} = process.env;
const app = express();
expressWs(app);

if(process.env.NODE_ENV !== 'test'){
  mongoose
    .connect(ATLAS_URI)
    .then(() => console.log("MongoDB is  connected successfully"))
    .catch((err) => console.error(err));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
//app.use("/api/blackjack", blackjack);


}

//app.use("/api/blackjack", blackjack);

app.ws('/', (ws, req) => {
  console.log(req.headers.cookie);
  let cookie = req.headers.cookie;
  let match = cookie.match(/username=\s*([\w\d_]+)/);
  console.log(match[1]);

  //Pass the websocket to blackjack.js to deal with
  handle_web_socket(ws, match[1]);
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.use(express.json());
app.use(cookieParser());
app.use("/", authRoute);
app.use("/", balanceRoute);
app.use("/", winloseRoute);
app.use("/", leaderboardRoute);
app.use("/", userInfoRoute);
app.use("/", tutorialRoutes);
app.use("/", betRoutes);
app.use("/", pokerRoute);

// Export the app for testing
module.exports = app;