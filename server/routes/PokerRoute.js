const express = require("express");
const router = express.Router();
const {StartPoker, DrawCards, ScoreHand} = require("../Controllers/PokerController");

router.post("/poker/start", StartPoker);
router.get("/poker/draw", DrawCards);
router.post ("/poker/score", ScoreHand);

module.exports = router;