const express = require("express");
const router = express.Router();
const {getBalance, updateBalance, updateBalanceWithoutPassword, updateMoneySpent} = require("../Controllers/BalanceController");

router.get("/balance", getBalance);
router.post("/update-balance", updateBalance);
router.post("/update-balance-no-password", updateBalanceWithoutPassword);
router.post("/update-money-spent", updateMoneySpent)

module.exports = router;
