const express = require("express");
const { GetUserTutorials, MarkTutorialAsViewed } = require("../Controllers/UserTutorialController.js");

const router = express.Router();

router.get("/api/user-tutorials/:username", GetUserTutorials);
router.post("/api/user-tutorials/:username", MarkTutorialAsViewed);


module.exports = router;
