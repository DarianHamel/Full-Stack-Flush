const User = require("../Models/UserModel");
const History = require("../Models/History");

// This will retrieve their transaction history with all the names 
// inside the History database

module.exports.GetHistory = async (req, res, next) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(404).json({ message: "Username is required" });
        }

        const userHistory = await History.find({ username });
        if (userHistory.length === 0) {
            return res.status(400).json({ message: "No transactions were made yet" });
        }  

        res.status(200).json(userHistory);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Will create a transaction for a bet or deposit
// This will be called whenever a deposit in UserProfile is made
// or a Blackjack/Poker game is played and they have placed a bet

module.exports.MakeHistory = async (req, res, next) => {
    try {
        const { username, transaction, day, game } = req.body;

        if (username === undefined || transaction === undefined || game === undefined) {
            return res.status(404).json({ message: "Needed parameters needed" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser == undefined) {
            return res.status(400).json({ message: "Cannot locate user" });
        }

        if (game !== "Deposit" && game !== "Blackjack" && game !== "Poker") {
            return res.status(400).json({ message: "Game is not found" });
        }

        const userHistory = await History.create({
            username, 
            transaction, 
            game,
            day,
        });

        res.status(201).json({ message: "Added user transaction" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};