const axios = require("axios");

/*
Handle the wins of the user
Calls route /updateStats
Input: Takes the bet and game (type)
*/
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
/*
Handle the losses of the user
Calls route /updateStats
Input: Takes the bet and game (type)
*/
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