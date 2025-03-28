const express = require("express");
const router = express.Router();
const {startPoker, drawCards, scoreHand, sortHand} = require("../Controllers/PokerController");

router.post("/poker/start", startPoker);
router.get("/poker/draw", drawCards);
router.post ("/poker/score", scoreHand);
router.post("/poker/sort-hand", sortHand);

module.exports = router;