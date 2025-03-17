const User = require("../Models/UserModel");


module.exports.bet = async (req, res) => {
    const { username, money } = req.body;
    var message = "";
    try {
        const user = await User.findOne({ username });
        if (!user) {    
            return res.status(404).json({ message: "User not found" });
        }
        if(money > user.balance){
            return res.status(400).json({ message: "Insufficient balance" });
        }
        user.balance -= Number(money); // Remove money from user account so they cannot leave the game before it completes
        user.markModified("balance");
        await user.save();

        const todaySpending = user.dailyMoneySpent;
        const averageDailySpending = (user.moneySpent-todaySpending) / user.numLogins;
        console.log("Today's spending:", todaySpending);
        console.log("Average daily spending:", averageDailySpending);
        if(todaySpending > averageDailySpending){
            message = "You're spending more than your average daily amount";
        }
        res.status(200).json({ money: user.balance , message: message});
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};