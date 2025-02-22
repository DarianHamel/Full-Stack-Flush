// Win Losses Controller

const User = require("../Models/UserModel");

// Get User Wins by username

module.exports.GetWins = async (req, res) => {
    const { username } = req.query; 
    try {
      const user = await User.findOne({ username }); 
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ wins: user.wins });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  

// Get User Losses by username

module.exports.GetLosses = async (req, res) => {
    const { username } = req.query; 
    try {
      const user = await User.findOne({ username }); 
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ losses: user.losses });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };


// Update Stats

module.exports.UpdateStats = async (req, res) => {
  try {
      const { username, wins, losses } = req.body;

      if (!username) {
        return res.status(400).json({ message: "Invalid request. Provide a username." })
      }

      if (wins < 0 || losses < 0) {
          return res.status(400).json({ success: false, message: "Invalid values" });
      }

      const user = await User.findOne({ username }); // This will search by username field
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      if (wins !== undefined) user.wins += wins;   
      if (losses !== undefined) user.losses += losses;

      await user.save();
      res.json({ success: true, wins: user.wins, losses: user.losses }); // Fix: Send updated stats
  } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
  }
};


