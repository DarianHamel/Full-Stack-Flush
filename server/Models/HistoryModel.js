const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  username: { type: String, required: true },
  transaction: { type: Number, required: true },
  game: { type: String, required: true },
  day: { type: Date, default: Date.now },
});

module.exports = mongoose.model("History", historySchema);
