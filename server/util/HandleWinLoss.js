const axios = require("axios");

const handleWin = async (username, bet, game) => {
    if (!username) return;
    try {
      const { data } = await axios.post(
        "http://localhost:5050/updateStats",
        { username: username, wins: 1, losses: 0 , money: bet, game: game },
        { withCredentials: true}
      );
      //setWins(data.wins); // Fix: Update state correctly
    } catch (error) {
      console.error("Error updating wins: ", error);
    }
  };

  const handleLose = async (username, bet, game) => {
    if (!username) return;
    try {
      const { data } = await axios.post(
        "http://localhost:5050/updateStats",
        { username: username, wins: 0, losses: 1 , money: bet, game: game},
        { withCredentials: true}
      );
      //setLoses(data.losses); // Fix: Update state correctly
    } catch (error) {
      console.error("Error updating losses: ", error);
    }
  };


  module.exports = { handleLose, handleWin };