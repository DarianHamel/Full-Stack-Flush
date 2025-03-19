const mongoose = require("mongoose");

const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  difficulty: { type: String, required: true},
  video_url: { type: String, required: true}
})

module.exports = mongoose.model("Tutorial", tutorialSchema);
