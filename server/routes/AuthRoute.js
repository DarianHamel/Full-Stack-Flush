// Routes for API
const { signup, login } = require("../Controllers/AuthController");
const { userVerification } = require("../Middleware/AuthMiddleware");
const router = require("express").Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/", userVerification);

module.exports = router;