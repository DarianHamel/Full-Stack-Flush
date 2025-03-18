const express = require("express");
const router = express.Router();
const {StartPoker} = require("../Controllers/PokerController");

router.get("/poker/start", StartPoker);

module.exports = router;