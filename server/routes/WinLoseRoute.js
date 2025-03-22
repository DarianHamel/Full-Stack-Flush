const express = require("express");
const router = express.Router();
const { GetWins, GetLosses, UpdateStats, HandleTransaction } = require("../Controllers/WinLoseController");

router.get("/getWins", GetWins);
router.get("/getLosses", GetLosses);
router.post("/updateStats", UpdateStats);
router.post("/handleTransaction", HandleTransaction);

module.exports = router;