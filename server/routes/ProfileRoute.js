const express = require("express");
const router = express.Router();
const { GetUserInfo, GetMoneySpent, GetTimeSpent } = require("../Controllers/ProfileController");

router.get("/userInfo", GetUserInfo);
router.get("/moneySpent", GetMoneySpent);
router.get("/timeSpent", GetTimeSpent);

module.exports = router;