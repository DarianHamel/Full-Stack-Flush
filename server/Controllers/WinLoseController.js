// Win Losses Controller

const { TbHistory } = require("react-icons/tb");
const User = require("../Models/UserModel");
const History = require("../Models/History");

/* 
Get User Wins by username
*/
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
  

/*
Get User Losses by username
*/
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


/* 
Update the users stats and history of the input username
Updates History, wins, losses, money spent and the balance
*/
module.exports.UpdateStats = async (req, res) => {
  try {
      const { username, wins, losses, money, game, day } = req.body;

      if (!username) {
        return res.status(400).json({ message: "Invalid request. Provide a username." })
      }

      if (wins < 0 || losses < 0) {
          return res.status(400).json({ success: false, message: "Invalid values" });
      }

      if (game !== "Blackjack" && game !== "Poker") {
        return res.status(400).json({ success: false, message: "Game not found" });
      }

      const user = await User.findOne({ username }); // This will search by username field
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      // only add a history when there is money involved 
      // which was integrated after another sprint 
      if (money !== undefined) {
        let transaction = money;
        if (losses !== undefined && losses > 0) { // make money deposited a negative is lost
          transaction = money * -1;
        }
        await History.create({
          username, 
          transaction,
          game,
          day,
        });
      }

      if (wins !== undefined && wins > 0){ 
        user.wins += wins;
        if(money !== undefined){
          await user.updateMoneyWon(money);
        }
      }

      if (losses !== undefined && losses > 0){
        user.losses += losses;
        if(money !== undefined){
          await user.updateMoneySpent(money);
        }
      }

      // so password isnt rehashed
      user.markModified('wins');
      user.markModified('losses');

      await user.save();
      res.status(200).json({ success: true, wins: user.wins, losses: user.losses }); // Fix: Send updated stats
  } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
  }
};


