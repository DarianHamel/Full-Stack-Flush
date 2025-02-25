//const db = require('../db/connection.js');
const mongoose = require("mongoose");
//will be deleted when user db is made
const leaderboardSchema = new mongoose.Schema ({
    username: String,
    wins: Number,
    losses: Number,
    moneySpent: Number,
    timeSpent: Number,
});

//const leaderboardList = db.collection("leaderboard");
module.exports = mongoose.model("Leaderboard", leaderboardSchema);
//module.exports = mongoose.model("Leaderboard", leaderboardList);
