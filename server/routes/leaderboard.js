const express = require("express");
const router = express.Router();
const GetLeaderboard = require("../Controllers/LeaderboardController");

router.get("/leaderboard", GetLeaderboard);

module.exports = router;