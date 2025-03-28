const express = require("express");
const router = express.Router();
const { getWins, getLosses, updateStats, handleTransaction } = require("../Controllers/WinLoseController");

router.get("/getWins", getWins);
router.get("/getLosses", getLosses);
router.post("/updateStats", updateStats);
router.post("/handleTransaction", handleTransaction);

module.exports = router;