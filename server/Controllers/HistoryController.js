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

// Will create a deposit history for the users 
// Whenever they go to the profile page and deposit money onto their account, 
// their records of depositing money will be recorded

module.exports.CreateDeposit = async (req, res, next) => {
    try {
        const { username, transaction, day, deposit } = req.body;

        if (username === undefined || transaction === undefined || deposit === undefined) {
            return res.status(404).json({ message: "Needed parameters needed" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser == undefined) {
            return res.status(400).json({ message: "Cannot locate user" });
        }  

        const user_history = await History.create({
            username, 
            transaction, 
            day,
        });

        res.status(201).json({ message: "User history created" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};