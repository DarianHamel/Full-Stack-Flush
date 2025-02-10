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
        const {sortBy} = req.query;
        //const sortCriteria = sortBy || 'level';
        let collection = await db.collection("leaderboard");
        let results = await collection.find({}).toArray();//.sort({[sortCriteria]: 1}).toArray();
        console.log("Leaderboard data: ", results);
        res.send(results).status(200);
        //let query = { _id: new ObjectId(req.params.id) };
        //let result = await collection.findOne(query);

        //if (!result) res.send("Not found").status(404);
        //else res.send(result).status(200);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Error occured when fetching the leaderboard");
    }
});

export default router;