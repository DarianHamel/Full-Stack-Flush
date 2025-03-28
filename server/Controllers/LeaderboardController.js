const User = require("../Models/UserModel");

/*
Get the leaderboard
Returns the results in the appropriate sorting after calculating the win loss ratios
*/
module.exports.getLeaderboard = async(req, res) => {
    try {
        const sortBy = req.query.sortBy?.toString() || "wins";
        const order = req.query.order?.toString() || "desc";
        const filter = req.query.filter?.toString() || "";
        
        const sortFields = ["username", "winLossRatio", "wins", "losses", "moneySpent", "timeSpent"]; // sorting options

        if(!sortFields.includes(sortBy)){
            return res.status(400).json({error: "Invalid sorting option"});
        }

        let filterCriteria = module.exports.applyFilters(filter);

        let results = await User.find(filterCriteria);

        results = JSON.parse(JSON.stringify(results));
        results = module.exports.calculateWinLossRatio(results);
        results = module.exports.sortLeaderboard(results, sortBy, order);

        res.status(200).json(results);
    }
    catch(err){
        res.status(500).json({ error: "Error occured when fetching the leaderboard" });
    }
};

/*
Filtering leaderboard
*/
module.exports.applyFilters = (filter) => {
    let filterCriteria = {};

    if(filter === "highSpenders"){
        filterCriteria = {moneySpent: {$gte: 1500}} //users that have spent exactly or over $1500 are considered high spenders
    }
    else if(filter === "longestPlayers"){
        filterCriteria = {timeSpent: {$gte: 100*3600}} //users that have spent exactly or over 100hrs are considered the longest players
    }

    return filterCriteria;
};

/*
Calculating the win - loss ratio
*/
module.exports.calculateWinLossRatio = (users) => {
    return users.map(user => ({
        ...user,
        winLossRatio: user.losses > 0 
        ? (user.wins/user.losses).toFixed(2)
        : user.wins
    }));
};

/*
Sorting and ordering the leaderboard 
*/
module.exports.sortLeaderboard = (users, sortBy, order) => {
    return users.sort((user1, user2) => {
        if(sortBy === "username"){
            return order === "asc" 
            ? user1.username.toLowerCase().localeCompare(user2.username.toLowerCase()) 
            : user2.username.toLowerCase().localeCompare(user1.username.toLowerCase());
        }

        return order === "asc" 
        ? user1[sortBy] - user2[sortBy] 
        : user2[sortBy] - user1[sortBy];
    });
};