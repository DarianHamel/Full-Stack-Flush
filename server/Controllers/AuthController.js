const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");

/* 
Logic for handling signup and login requests
Checks if username already exists for signup
*/
module.exports.signup = async (req, res, next) => {
  try {
    const { password, username, createdAt, balance, wins, losses, timeSpent, moneySpent } = req.body;

    if (password == undefined || username == undefined) {
      return res.status(404).json({ message: "Needed parameters needed" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ 
      password, 
      username, 
      createdAt, 
      balance: balance ?? 100, 
      wins: wins ?? 0,
      losses: losses ?? 0,
      timeSpent: timeSpent ?? 0,
      moneySpent: moneySpent ?? 0
    });

    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true, 
      httpOnly: false,
    });

    res.status(201).json({ 
      message: "User signed in successfully", 
      success: true, user, token, 
    });

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/*
Checks for matching username/password pair in database
*/
module.exports.login = async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if(username == undefined) {
        return res.status(400).json({message:'All fields are required'})
      }
      if(password == undefined) {
        return res.status(400).json({message:'All fields are required'})
      }
      const user = await User.findOne({ username });
      if(user == undefined){
        return res.status(404).json({message:'Incorrect password or username' }) 
      }
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) {
        return res.status(401).json({message:'Incorrect password or username'}) 
      }
       const token = createSecretToken(user._id);
       res.cookie("token", token, {
         withCredentials: true,
         httpOnly: false,
       });
       res.status(201).json({ message: "User logged in successfully", success: true, token, });
       next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }