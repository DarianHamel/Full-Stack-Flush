import db from './connection.js';

const leaderboardSchema = {
    name: String,
    wins: Number,
};

const leaderboardList = db.collection("leaderboard");
export {leaderboardSchema, leaderboardList};