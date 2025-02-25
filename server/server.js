const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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