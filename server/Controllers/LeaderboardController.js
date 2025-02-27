const User = require("../Models/UserModel");

module.exports.GetLeaderboard = async(req, res) => {
    try {
        console.log("test");
        const {sortBy = "wins", order = "desc", filter = ""} = req.query; //sort by wins as default
        const sortFields = ["username", "winLossRatio", "wins", "losses", "moneySpent", "timeSpent"]; // sorting options

        if(!sortFields.includes(sortBy)){
            console.log(`Leaderboard data sorted by ${sortBy}`);
            return res.status(400).json({error: "Invalid sorting option"});
        }

        let filterCriteria = module.exports.applyFilters(filter);

        let results = await User.find(filterCriteria);
        console.log(results);

        results = JSON.parse(JSON.stringify(results));
        results = module.exports.calculateWinLossRatio(results);
        results = module.exports.sortLeaderboard(results, sortBy, order);

        console.log(`Leaderboard data sorted by ${sortBy}, in order ${order} with filter ${filter}: `, results);
        res.status(200).json(results);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Error occured when fetching the leaderboard");
    }
};

// filtering leaderboard
module.exports.applyFilters = (filter) => {
    let filterCriteria = {};

    if(filter === "highSpenders"){
        filterCriteria = {moneySpent: {$gte: 1500}} //users that have spent exactly or over $1500 are considered high spenders
    }
    else if(filter === "longestPlayers"){
        filterCriteria = {timeSpent: {$gte: 100}} //users that have spent exactly or over 100hrs are considered the longest players
    }

    return filterCriteria;
  };

// calculating the win - loss ratio
module.exports.calculateWinLossRatio = (users) => {
    return users.map(user => ({
        ...user,
        winLossRatio: user.losses > 0 
        ? (user.wins/user.losses).toFixed(2)
        : user.wins
    }));
  };

// sorting and ordering the leaderboard 
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