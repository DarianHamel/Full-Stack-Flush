const express = require("express");
const router = express.Router();
const {StartPoker, DrawCards, ScoreHand, sortHand} = require("../Controllers/PokerController");

router.post("/poker/start", StartPoker);
router.get("/poker/draw", DrawCards);
router.post ("/poker/score", ScoreHand);
router.post("/poker/sort-hand", sortHand);

module.exports = router;