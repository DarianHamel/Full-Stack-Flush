const express = require("express");
const router = express.Router();
const {GetBalance, UpdateBalance} = require("../Controllers/BalanceController");

router.get("/balance", GetBalance);
router.post("/update-balance", UpdateBalance);

module.exports = router;
