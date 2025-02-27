const express = require("express");
const router = express.Router();
const { GetWins, GetLosses, UpdateStats } = require("../Controllers/WinLoseController");

router.get("/getWins", GetWins);
router.get("/getLosses", GetLosses);
router.post("/updateStats", UpdateStats);

module.exports = router;