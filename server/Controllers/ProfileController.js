const User = require("../Models/UserModel");

/*
Find a user in the database by their username
Returns the user if found or the respective error and status
*/
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

/*
Get the username and password along with time and money limits
*/
module.exports.getUserInfo = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ message: error });
  }
  res.status(200).json({ username: user.username, password: user.password , timeLimit: user.timeLimit, moneyLimit: user.moneyLimit });
};

/*
Get the balance of the user
*/
module.exports.getBalance = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ message: error });
  }
  res.status(200).json({ balance: user.balance });
}

/*
Set the time spent playing of the user
*/
module.exports.setTimeSpent = async (req, res) => {
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

/*
Get the last day logged in
This is called in order to determine user limit resets
*/
module.exports.getLastLogin = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ message: error });
  }
  res.status(200).json({ lastLogin: user.lastLogin });
};

/*
Reset the limits of the user
This is called if the user logged in a different day 
and resets the users limits to allow for betting again
*/
module.exports.resetDailyLimits = async (req, res) => {
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

/*
Get the money limit of the user
Money limit restricts the user to a dollar spend amount of {moneyLimit}
*/
 module.exports.getMoneyLimit = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ success: false, message: error });
  }
  res.status(200).json({ success: true, moneyLimit: user.moneyLimit });
};

/*
Get the limits of the user and related information to check if user hit their limits
*/
module.exports.getLimits = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ success: false, message: error });
  }
  res.status(200).json({ success: true, moneyLimit: user.moneyLimit, timeLimit: user.timeLimit , timeSpent: user.dailyTimeSpent, moneySpent: user.dailyMoneySpent , balance: user.balance});
};

/*
Get the users stats; timeSpent, moneySpent, Wins, Losses
*/
module.exports.getStats = async (req, res) => {
  const { username } = req.query;
  const { user, error, status } = await findUserByUsername(username);
  if (error) {
    return res.status(status).json({ success: false, message: error });
  }
  res.status(200).json({ success: true, timeSpent: user.timeSpent, moneySpent: user.moneySpent , wins: user.wins, losses: user.losses});
};

/*
Set the time limit of the user
Time limit restricts the user to a playtime of {timeLimit}
*/
module.exports.setTimeLimit = async (req, res) => {
  const { username, newLimit } = req.body;
  if (newLimit != undefined && newLimit > 0) {
    const { user, error, status } = await findUserByUsername(username);
    if (error) {
      return res.status(status).json({ success: false, message: error });
    }
    user.timeLimit = newLimit;
    user.markModified("timeLimit");
    await user.save();
    res.status(200).json({ success: true, message: "Time limit updated" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid time limit" });
  }
};

/*
Set the money limit of the user
Money limit restricts the user to a dollar spend amount of {moneyLimit}
*/
module.exports.setMoneyLimit = async (req, res) => {
  const { username, moneyLimit } = req.body;
  if (moneyLimit != undefined && moneyLimit > 0) {
    const { user, error, status } = await findUserByUsername(username);
    if (error) {
      return res.status(status).json({ success: false, message: error });
    }
    user.moneyLimit = moneyLimit;
    user.markModified("moneyLimit");
    await user.save();
    res.status(200).json({ success: true, message: "Money limit updated" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid money limit" });
  }
};