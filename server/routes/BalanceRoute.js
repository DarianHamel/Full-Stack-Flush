const router = require("express").Router();
const balanceController = require("../Controllers/BalanceController");

router.get("/balance", balanceController.GetBalance);
route.patch("/balance", balanceController.UpdateBalance);

module.exports = router;