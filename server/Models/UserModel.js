const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 100 }, 
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 }
});

userSchema.pre("save", async function () {
  // only if password modified, so it doesn't update when changing stats and other data
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

module.exports = mongoose.model("User", userSchema);
