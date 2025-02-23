import express from "express";
import { leaderboardList } from "../Models/LeaderboardModel.js";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

router.get("/", async(req, res) => {
    try{
        const {sortBy = "wins", order = "desc", filter = ""} = req.query; //sort by wins as default
        const sortFields = ["username", "winLossRatio", "wins", "losses", "moneySpent", "timeSpent"]; // sorting options

        if(!sortFields.includes(sortBy)){
            console.log(`Leaderboard data sorted by ${sortBy}`);
            return res.status(400).json({error: "Invalid sorting option"});
        }

        let collection = await db.collection("leaderboard");

        // filtering options
        let filterCriteria = {};
        if(filter === "highSpenders"){
            filterCriteria = {moneySpent: {$gte: 1500}} //users that have spent exactly or over $1500 are considered high spenders
        }
        else if(filter === "longestPlayers"){
            filterCriteria = {timeSpent: {$gte: 100}} //users that have spent exactly or over 100hrs are considered the longest players
        }

        let results = await collection.find(filterCriteria).toArray();

        //im not sure if the win/loss ratio would be part of the db but for now just calculate it based on the wins and losses
        //add the calculated win/loss ratio to the results sent
        results = results.map(user => ({
            ...user,
            winLossRatio: user.losses > 0 ? (user.wins/user.losses).toFixed(2): user.wins
        }));

        //sort the results based on the selected option
        results.sort((user1, user2) => {
            if(sortBy === "username"){
                return order === "asc" ? user1.username.toLowerCase().localeCompare(user2.username.toLowerCase()) : user2.username.toLowerCase().localeCompare(user1.username.toLowerCase());
            }

            return order === "asc" ? user1[sortBy] - user2[sortBy] : user2[sortBy] - user1[sortBy];
        });

        console.log(`Leaderboard data sorted by ${sortBy}, in order ${order} with filter ${filter}: `, results);
        res.status(200).json(results);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Error occured when fetching the leaderboard");
    }
});

export default router;
