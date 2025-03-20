const express = require("express");
const router = express.Router();
const { bet } = require("../Controllers/BetController");

router.post("/Bet", bet);

module.exports = router;