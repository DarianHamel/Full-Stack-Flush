const express = require("express");
const router = express.Router();
const { GetUserInfo, GetBalance, GetLastLogin, GetMoneyLimit, SetTimeSpent, GetLimits, ResetDailyLimits } = require("../Controllers/ProfileController");

router.get("/userInfo", GetUserInfo);
router.get("/getBalance", GetBalance);
router.get("/getMoneyLimit", GetMoneyLimit);
router.get("/getLastLogin", GetLastLogin);
router.get("/getLimits", GetLimits);
router.post("/setTimeSpent", SetTimeSpent);
router.post("/resetDailyLimits", ResetDailyLimits);


module.exports = router;