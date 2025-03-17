const User = require("../Models/UserModel");


module.exports.bet = async (req, res) => {
    const { username, money } = req.body;
    console.log("We made it to bet controller - Username:", username);
    try {
        console.log("We made it to bet controller - Money:", money);
        const user = await User.findOne({ username });
        if (!user) {    
            return res.status(404).json({ message: "User not found" });
        }
        user.balance -= Number(money); // Remove money from user account so they cannot leave the game before it completes
        user.markModified("balance");
        await user.save();
        res.status(200).json({ money: user.balance });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};