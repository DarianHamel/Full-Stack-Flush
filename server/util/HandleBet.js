const axios = require("axios");

const handleBet = async (username, bet) => {
    if (!username) return;
    try {
        const { data } = await axios.post(
        "http://localhost:5050/Bet",
        { username: username, money: bet},
        { withCredentials: true}
        );
        console.log("Money: ", data.money);
    } catch (error) {
        console.error("Error updating losses: ", error);
    }
};

module.exports = { handleBet };