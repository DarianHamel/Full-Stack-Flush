import express from "express";
import Game from "../models/Game.js";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /api/blackjack.
const router = express.Router();

let currentGame;

// This section will help start a game
router.post("/start", async (req, res) => {
    currentGame = new Game();
});

export default router;
