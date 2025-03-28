const express = require("express");
const { getTutorials } = require("../Controllers/TutorialController.js");

const router = express.Router();

router.get("/api/tutorials", getTutorials);


module.exports = router;
