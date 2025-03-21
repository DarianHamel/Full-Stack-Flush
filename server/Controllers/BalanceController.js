const User = require("../Models/UserModel");
const History = require("../Models/History");
const bcrypt = require("bcryptjs");

/*
Get User Balance by username
*/
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

/*
Update balance for deposit or bet (POST request)
*/
module.exports.UpdateBalance = async (req, res) => {
  const { username, amount, password, day } = req.body;
  
  if (!username || typeof amount !== 'number') {
    return res.status(400).json({ message: "Invalid request. Provide username and amount as a number.", success: false });
  }

  try {
    const user = await User.findOne({ username }); 
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(400).json({ message: "Incorrect password", success: false }) 
    }

    const newBalance = user.balance + amount; 
    if (newBalance < 0) {
      return res.status(400).json({ message: "Insufficient balance", success: false });
    }

    user.balance = newBalance; 
    await user.save();
    const transaction = amount;
    const game = "Deposit";
    await History.create({
      username, 
      transaction,
      game,
      day,
    });
    
    res.status(200).json({ balance: user.balance, success: true });

  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
    console.log(error);
  }
};

/* 
Update balance without requiring a password (for game results)
added this to deal with unable to update balance after a win because password is required in other method 
*/
module.exports.UpdateBalanceWithoutPassword = async (req, res) => {
  const { username, amount, day } = req.body;

  if (!username || typeof amount !== "number") {
    return res.status(400).json({
      message: "Invalid request. Provide username and amount as a number.",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const newBalance = user.balance + amount;
    if (newBalance < 0) {
      return res.status(400).json({ message: "Insufficient balance", success: false });
    }

    user.balance = newBalance;
    await user.save();
    console.log(newBalance);
    console.log(user.balance);
    const transaction = amount;
    const game = "Poker";
    await History.create({
      username, 
      transaction,
      game,
      day,
    });

    res.status(200).json({ balance: user.balance, success: true });
  } catch (error) {
    console.error("Error updating balance:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.UpdateMoneySpent = async (req, res) => {
  const { username, moneySpent } = req.body;

  if (!username || moneySpent === undefined) {
    return res.status(400).json({ success: false, message: "Invalid request data" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.updateMoneySpent(moneySpent);
    await user.save();

    console.log(user.moneySpent);

    res.status(200).json({ success: true, message: "Money spent updated successfully", updatedDailyMoneySpent: user.moneySpent });
  } catch (error) {
    console.error("Error updating money spent:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
