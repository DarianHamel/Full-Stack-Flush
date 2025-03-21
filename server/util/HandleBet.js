const axios = require("axios");

/*
Handles the bet
Calls the route /Bet
Input parameters: username and bet
Returns: A message containing their gambling habits (if the user played enough)
*/
const handleBet = async (username, bet) => {
    if (!username) return;
    try {
        const { data } = await axios.post(
        "http://localhost:5050/Bet",
        { username: username, money: bet},
        { withCredentials: true}
        );
        console.log("Money: ", data.money);
        return data.message;
    } catch (error) {
        console.error("Error updating losses: ", error);
    }
};

module.exports = { handleBet };