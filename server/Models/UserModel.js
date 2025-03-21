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
  dailyMoneySpent: { type: Number, default: 0 },
  timeLimit: { type: Number, default: 3600 }, // 1 hour initial limit
  moneyLimit: { type: Number, default: 100 }, // $100 initial limit
  lastLogin: { type: Date, default: Date.now() }, //Track users last day logged in to reset daily limits
  numLogins: { type: Number, default: 0 },
});

userSchema.pre("save", async function () {
  // only if password modified, so it doesn't update when changing stats and other data
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

/*
Update the time spent of the user with the respective timeSpent
*/
userSchema.methods.updateTimeSpent = async function (timeSpent) {
  this.dailyTimeSpent += timeSpent;
  this.timeSpent += timeSpent;
  await this.save();
};

/*
Update the money spent of the user with the respective money
*/
userSchema.methods.updateMoneySpent = async function (money) {
  this.dailyMoneySpent += Number(money);
  this.moneySpent += Number(money);
  console.log("Daily Money Spent: ", this.dailyMoneySpent);
  console.log("Total Money Spent: ", this.moneySpent);
  this.markModified('moneySpent');
  this.markModified('dailyMoneySpent');
};

/*
Update the money won of the user with the respective money
*/
userSchema.methods.updateMoneyWon = async function (money) {
  this.balance += Number(money);
  console.log("New Balance: ", this.balance);
  this.markModified('balance');
}

module.exports = mongoose.model("User", userSchema);
