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
        const {sortBy = "wins", order = "desc"} = req.query; //sort by wins as default
        const sortFields = {name: 1, wins: -1, losses: -1}; // default sorting rules
        const sortCriteria = sortFields[sortBy] || sortFields["wins"];

        let collection = await db.collection("leaderboard");
        let results = await collection.find({}).sort({[sortBy]: sortCriteria}).toArray();
        console.log("Leaderboard data: ", results);
        res.status(200).json(results);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Error occured when fetching the leaderboard");
    }
});

export default router;
