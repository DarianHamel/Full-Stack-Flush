// Logic for checking if user has access to a route by checking tokens
const User = require("../Models/UserModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ status: false, message: "No token provided" });

    jwt.verify(token, process.env.SECRET, async (err, data) => {
      if (err) return res.json({ status: false });

      try {
        const user = await User.findById(data.id);
        if (user) return res.json({ status: true, user: user.username });
        return res.json({ status: false });
      } catch (dbError) {
        return res.json({ status: false, message: "Database error" });
      }
    });
  } catch (error) {
    return res.json({ status: false, message: "Server error" });
  }
};
