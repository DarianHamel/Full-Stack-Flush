const express = require('express');
const router = express.Router();
const { getHistory, makeHistory } = require("../Controllers/HistoryController");

router.get("/getHistory", getHistory);
router.post("/makeHistory", makeHistory);

module.exports = router;