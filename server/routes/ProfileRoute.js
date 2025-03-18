const express = require("express");
const router = express.Router();
const { GetUserInfo, GetBalance, GetLastLogin, GetMoneyLimit, SetTimeSpent, GetLimits, GetStats,ResetDailyLimits, SetMoneyLimit, SetTimeLimit } = require("../Controllers/ProfileController");

router.get("/userInfo", GetUserInfo);
router.get("/getBalance", GetBalance);
router.get("/getMoneyLimit", GetMoneyLimit);
router.get("/getLastLogin", GetLastLogin);
router.get("/getLimits", GetLimits);
router.get("/getStats", GetStats);
router.post("/setTimeSpent", SetTimeSpent);
router.post("/resetDailyLimits", ResetDailyLimits);
router.post("/setMoneyLimit", SetMoneyLimit);
router.post("/setTimeLimit", SetTimeLimit);


module.exports = router;