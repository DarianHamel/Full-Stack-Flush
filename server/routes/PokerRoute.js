const express = require("express");
const router = express.Router();
const {StartPoker, DrawCards} = require("../Controllers/PokerController");

router.get("/poker/start", StartPoker);
router.get("/poker/draw", DrawCards);

module.exports = router;