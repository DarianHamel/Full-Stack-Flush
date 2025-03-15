const express = require("express");
const router = express.Router();
const { GetUserInfo, GetMoneySpent, GetTimeLimit, SetMoneySpent, GetTimeSpent, SetTimeSpent } = require("../Controllers/ProfileController");

router.get("/userInfo", GetUserInfo);
router.get("/moneySpent", GetMoneySpent);
router.get("/timeSpent", GetTimeSpent);
router.get("/getTimeLimit", GetTimeLimit);
router.post("/setMoneySpent", SetMoneySpent);
router.post("/setTimeSpent", SetTimeSpent);


module.exports = router;