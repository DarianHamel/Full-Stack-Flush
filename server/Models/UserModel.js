// The user model for creating a user account
// Currently just has a basic username/password schema
// Will eventually add the user stats related stuff here too
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  balance: {
    type: Number, 
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  loss: {
    type: Number, 
    default: 0,
  },
  // insert user stats and other stuff we want to track here
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("User", userSchema);