import db from '../db/connection.js';
//will be deleted when user db is made
const leaderboardSchema = {
    name: String,
    wins: Number,
    losses: Number,
};

const leaderboardList = db.collection("leaderboard");
export {leaderboardSchema, leaderboardList};
