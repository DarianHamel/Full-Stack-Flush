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

module.exports.GetTimeLimit = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, timeLimit: user.timeLimit });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
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

module.exports.SetMoneySpent = async (req, res) => {
  const { username, money } = req.body;
  try {
    const user = await User.findOne({ username }); 
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (money != undefined && money > 0) {
      await user.updateMoneySpent(money);
      res.status(200).json({ success: true, moneySpent: user.moneySpent });
    } else {
      return res.status(400).json({ success: false, message: "Invalid money value" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}
  
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

module.exports.SetTimeSpent = async (req, res) => {
  const { username, timeSpent } = req.body;
  try {
    const user = await User.findOne({ username }); 
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (timeSpent != undefined && timeSpent > 0) {
      await user.updateTimeSpent(timeSpent);
      res.status(200).json({ success: true, timeSpent: user.timeSpent });
    } else {
      return res.status(400).json({ success: false, message: "Invalid time value" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}