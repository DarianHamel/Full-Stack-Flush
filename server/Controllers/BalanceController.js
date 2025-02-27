const User = require("../Models/UserModel");

// Get User Balance by username
module.exports.GetBalance = async (req, res) => {
    const { username } = req.query; 
    try {
      const user = await User.findOne({ username }); 
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ balance: user.balance });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  

// Update balance for deposit or bet (POST request)
module.exports.UpdateBalance = async (req, res) => {
  const { username, amount } = req.body;
  
  if (!username || typeof amount !== 'number') {
    return res.status(400).json({ message: "Invalid request. Provide username and amount as a number." });
  }

  try {
    const user = await User.findOne({ username }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newBalance = user.balance + amount; 
    if (newBalance < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.balance = newBalance; 
    await user.save();
    res.status(200).json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
