const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 100 }, 
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  moneySpent: { type: Number, default: 0},
  timeSpent: { type: Number, default: 0}
});

module.exports = mongoose.model("User", userSchema);
