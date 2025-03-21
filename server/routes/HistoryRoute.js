const express = require('express');
const router = express.Router();
const { GetHistory, MakeHistory } = require("../Controllers/HistoryController");

router.get("/getHistory", GetHistory);
router.post("/makeHistory", MakeHistory);

module.exports = router;