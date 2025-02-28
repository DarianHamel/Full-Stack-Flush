const User = require("../Models/UserModel");

module.exports.GetUserInfo = async (req, res) => {
    const { username } = req.query; 
    try {
      const user = await User.findOne({ username }); 
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ username: user.username, password: user.password });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

module.exports.GetMoneySpent = async (req, res) => {
  const { username } = req.query; 
  try {
    const user = await User.findOne({ username }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ moneySpent: user.moneySpent });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
  
module.exports.GetTimeSpent = async (req, res) => {
  const { username } = req.query; 
  try {
    const user = await User.findOne({ username }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ timeSpent: user.timeSpent });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};