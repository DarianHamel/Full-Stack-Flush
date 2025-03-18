const PokerGame = require('../Models/PokerGame');

// temporary just declaring a hard coded game for testing purposes
let game = new PokerGame(1);

module.exports.StartPoker = async (req, res) => {
    game.startGame();
    res.json({
        playerHand: game.getPlayerHand()
    });
};