const express = require("express");
const { getUserTutorials, markTutorialAsViewed } = require("../Controllers/UserTutorialController.js");

const router = express.Router();

router.get("/api/user-tutorials/:username", getUserTutorials);
router.post("/api/user-tutorials/:username", markTutorialAsViewed);


module.exports = router;
