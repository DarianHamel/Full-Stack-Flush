const User = require("../Models/UserModel");

const findUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return { error: "User not found", status: 404 };
    }
    return { user };
  } catch (error) {
    return { error: "Server error", status: 500 };
  }
};

module.exports.GetUserInfo = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ message: error });
  }
  res.status(200).json({ username: user.username, password: user.password });
};

module.exports.GetBalance = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ message: error });
  }
  res.status(200).json({ balance: user.balance });
}


module.exports.SetTimeSpent = async (req, res) => {
  const { username, timeSpent } = req.body;
  if (timeSpent != undefined && timeSpent > 0) {
    const { user, error, status } = await findUserByUsername(username);
    if (error) {
      return res.status(status).json({ success: false, message: error });
    }
    await user.updateTimeSpent(timeSpent);
    res.status(200).json({ success: true, timeSpent: user.timeSpent });
  } else if(timeSpent == 0){
    res.status(200).json({ success: true, message: "Time spent updated" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid time value" });
  }
};

module.exports.GetLastLogin = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ message: error });
  }
  res.status(200).json({ lastLogin: user.lastLogin });
};

module.exports.ResetDailyLimits = async (req, res) => {
  const { username } = req.body;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ success: false, message: error });
  }
  user.numLogins++;
  user.dailyTimeSpent = 0;
  user.lastLogin = Date.now();
  user.dailyMoneySpent = 0;
  await user.save();
  res.status(200).json({ success: true, message: "Daily limits reset" });
};


 module.exports.GetMoneyLimit = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ success: false, message: error });
  }
  res.status(200).json({ success: true, moneyLimit: user.moneyLimit });
};

module.exports.GetLimits = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ success: false, message: error });
  }
  res.status(200).json({ success: true, moneyLimit: user.moneyLimit, timeLimit: user.timeLimit , timeSpent: user.dailyTimeSpent, moneySpent: user.dailyMoneySpent });
}