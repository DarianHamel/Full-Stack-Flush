const express = require("express");
const router = express.Router();
const {GetBalance, UpdateBalance, UpdateBalanceWithoutPassword} = require("../Controllers/BalanceController");

router.get("/balance", GetBalance);
router.post("/update-balance", UpdateBalance);
router.post("/update-balance-no-password", UpdateBalanceWithoutPassword);

module.exports = router;
