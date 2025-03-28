const express = require("express");
const router = express.Router();
const { getUserInfo, getBalance, getLastLogin, getMoneyLimit, setTimeSpent, getLimits, getStats, resetDailyLimits, setMoneyLimit, setTimeLimit } = require("../Controllers/ProfileController");

router.get("/userInfo", getUserInfo);
router.get("/getBalance", getBalance);
router.get("/getMoneyLimit", getMoneyLimit);
router.get("/getLastLogin", getLastLogin);
router.get("/getLimits", getLimits);
router.get("/getStats", getStats);
router.post("/setTimeSpent", setTimeSpent);
router.post("/resetDailyLimits", resetDailyLimits);
router.post("/setMoneyLimit", setMoneyLimit);
router.post("/setTimeLimit", setTimeLimit);


module.exports = router;