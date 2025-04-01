// Win Losses Controller

const { TbHistory } = require("react-icons/tb");
const User = require("../Models/UserModel");
const History = require("../Models/HistoryModel");

/* 
Get User Wins by username
*/
module.exports.getWins = async (req, res) => {
    const username = req.query.username?.toString(); 
    try {
      const user = await User.findOne( {username: username} ); 
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
module.exports.getLosses = async (req, res) => {
    const  username  = req.query.username?.toString(); 
    try {
      const user = await User.findOne( {username: username }); 
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
module.exports.updateStats = async (req, res) => {
  try {
      const query = {
        username: req.body.username?.toString(),
        wins: Number(req.body.wins) || 0,
        losses: Number(req.body.losses) || 0,
        money: Number(req.body.money) || 0,
        game: req.body.game?.toString() ,
        day: req.body.day?.toString(),
      }

      if (query.username === undefined) {
        return res.status(400).json({ message: "Invalid request. Provide a username." });
      }

      if (query.wins < 0 || query.losses < 0) {
          return res.status(400).json({ success: false, message: "Invalid values" });
      }

      if (query.game !== "Blackjack" && query.game !== "Poker") {
        return res.status(400).json({ success: false, message: "Game not found" });
      }

      const user = await User.findOne( {username: query.username} ); // This will search by username field
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      // only add a history when there is money involved 
      // which was integrated after another sprint 
      if (query.money !== 0) {
        let transaction = query.money;
        if (query.losses > 0) { // make money deposited a negative is lost
          transaction = query.money * -1;
        }
        await History.create({
          username: query.username, 
          transaction,
          game: query.game,
          day: query.day,
        });
      }

      if (query.wins > 0){ 
        user.wins += query.wins;
        if(query.money){
          await user.updateMoneyWon(query.money);
        }
      }

      if (query.losses > 0){
        user.losses += query.losses;
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

module.exports.handleTransaction = async (req, res) => {
  try {
    const query = {
      username: req.body.username?.toString(),
      transaction: req.body.transaction?.toString(),
      game: req.body.game?.toString(),
      day: req.body.day?.toString(),
    }
    const {username, transaction, game, day} = query;

    if (!username || !transaction || game !== "Poker") {
      return res.status(400).json({ 
        success: false,
        message: "Invalid request. Provide a username." 
      });
    }

    await History.create({
      username, 
      transaction,
      game,
      day,
    });

    res.status(200).json({ success: true });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

