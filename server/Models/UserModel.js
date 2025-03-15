const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 100 }, 
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  moneySpent: { type: Number, default: 0},
  timeSpent: { type: Number, default: 0}, //In seconds
  dailyTimeSpent: { type: Number, default: 0 }, //In seconds
  timeLimit: { type: Number, default: 3600 }, // 1 hour initial limit
  moneyLimit: { type: Number, default: 100 }, // $100 initial limit
});

userSchema.pre("save", async function () {
  // only if password modified, so it doesn't update when changing stats and other data
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.updateTimeSpent = async function (timeSpent) {
  this.dailyTimeSpent += timeSpent;
  this.timeSpent += timeSpent;
  await this.save();
};

userSchema.methods.updateMoneySpent = async function (money) {
  this.moneySpent += money;
  await this.save();
};

module.exports = mongoose.model("User", userSchema);
