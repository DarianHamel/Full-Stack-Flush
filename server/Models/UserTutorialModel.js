const mongoose = require('mongoose');

const UserTutorialSchema = new mongoose.Schema({
  username: { type: String, required: true },
  tutorialsViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }],
});

module.exports = mongoose.model('UserTutorial', UserTutorialSchema);