const User = require("../Models/UserModel");

// Logic for getting the balance requests 
// This will return how much their balance is 

module.exports.GetBalance = async (req, res) => {
    try {

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ balance: user.balance });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

// Logic for updating the balance requests
// This will update their balance based on requested amount

module.exports.UpdateBalance = async (req, res) => {
    const {amount} = req.body;  // The amount to be added or subtracted
    if (typeof amount !== 'number') {
        return res.status(400).json({ message: "Amount must be a number" });
    }

    try {
        const user = await User.findById(req.userId); 
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        
        const newBalance = user.balance + amount;
        if (newBalance < 0) {
            return res.status(400).json({ message: "Insufficent balance" });
        }

        user.balance = newBalance;
        await user.save();
        res.status(200).json({ balance: user.balance });

    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

