const User = require("../Models/UserModel");

module.exports.bet = async (req, res) => {
    const { username, money } = req.body;
    var mess = "";
    try {
        const user = await User.findOne({ username });
        if (!user) {    
            return res.status(404).json({ message: "User not found" });
        }
        if(money > user.balance){
            return res.status(400).json({ message: "Insufficient balance" });
        }
        if (!game) {
            return res.status(400).json({ message: "No game was found" });
        }
        user.balance -= Number(money); // Remove money from user account so they cannot leave the game before it completes
        user.markModified("balance");
        await user.save();

        if(user.numLogins > 5){ //Don't update users until we get enough data
            const todaySpending = user.dailyMoneySpent;
            const averageDailySpending = ((user.moneySpent-todaySpending) / user.numLogins) || 0;
            console.log("Today's spending:", todaySpending);
            console.log("Average daily spending:", averageDailySpending);
            if(todaySpending > averageDailySpending){
                mess = "You're spending more than your average daily amount";
            }
        }
        res.status(200).json({ money: user.balance , message: mess});
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};