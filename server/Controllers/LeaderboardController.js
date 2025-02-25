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

       // let collection = await db.collection("leaderboard");

        // filtering options
        let filterCriteria = {};
        if(filter === "highSpenders"){
            filterCriteria = {moneySpent: {$gte: 1500}} //users that have spent exactly or over $1500 are considered high spenders
        }
        else if(filter === "longestPlayers"){
            filterCriteria = {timeSpent: {$gte: 100}} //users that have spent exactly or over 100hrs are considered the longest players
        }

        let results = await User.find();
        console.log(results);
        //res.status(200).json(results);
        results = JSON.parse(JSON.stringify(results));

        //im not sure if the win/loss ratio would be part of the db but for now just calculate it based on the wins and losses
        //add the calculated win/loss ratio to the results sent
        results = results.map(user => ({
            ...user,
            winLossRatio: user.losses > 0 ? (user.wins/user.losses).toFixed(2): user.wins
        }));

        //sort the results based on the selected option
        results.sort((user1, user2) => {
            if(sortBy === "username"){
                return order === "asc" ? user1.username.toLowerCase().localeCompare(user2.username.toLowerCase()) : user2.username.toLowerCase().localeCompare(user1.username.toLowerCase());
            }

            return order === "asc" ? user1[sortBy] - user2[sortBy] : user2[sortBy] - user1[sortBy];
        });

        console.log(`Leaderboard data sorted by ${sortBy}, in order ${order} with filter ${filter}: `, results);
        res.status(200).json(results);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Error occured when fetching the leaderboard");
    }
};