const express = require("express");
const { GetTutorials, GetTutorialId } = require("../Controllers/TutorialController.js");

const router = express.Router();

router.get("/api/tutorials", GetTutorials);


module.exports = router;
