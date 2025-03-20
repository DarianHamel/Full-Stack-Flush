const express = require('express');
const router = express.Router();
const { GetHistory, CreateDeposit } = require("../Controllers/HistoryController");

router.get("/getHistory", GetHistory);
router.post("/historyDeposit", CreateDeposit);

module.exports = router;