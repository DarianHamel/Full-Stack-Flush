const express = require("express");
const router = express.Router();
const { UpdateStats, GetWins, GetLosses } = require("../Controllers/WinLoseController");
const verifyToken = require("../Middleware/WinLoseMiddleware");

router.get("/getWins", GetWins);
router.get("/getLosses", GetLosses);
router.post("/updateStats", verifyToken, UpdateStats);

module.exports = router;