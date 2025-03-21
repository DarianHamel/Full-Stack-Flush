const express = require("express");
const router = express.Router();
const {GetBalance, UpdateBalance, UpdateBalanceWithoutPassword, UpdateMoneySpent} = require("../Controllers/BalanceController");

router.get("/balance", GetBalance);
router.post("/update-balance", UpdateBalance);
router.post("/update-balance-no-password", UpdateBalanceWithoutPassword);
router.post("/update-money-spent", UpdateMoneySpent)

module.exports = router;
