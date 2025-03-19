const PokerGame = require('../Models/PokerGame');

let activeGames = {};

module.exports.StartPoker = (req, res) => {
    const gameID = Date.now(); // should change to username tracking probably ?
    const newGame = new PokerGame(gameID);
    newGame.startGame();

    activeGames[gameID] = newGame;

    res.json({
        gameID,
        playerHand: newGame.getPlayerHand()
    });
};

module.exports.DrawCards = (req, res) => {
    const { gameID, count } = req.query;

    if (!activeGames[gameID]) {
        return res.status(404).json({ message: "Game not found" });
    }

    const game = activeGames[gameID];
    const newCards = game.deck.dealCard(count);

    res.json({ newCards });
};

module.exports.ScoreHand = (req, res) => {
    const { gameID, selectedCards } = req.body;

    if (!activeGames[gameID]) {
        return res.status(404).json({ message: "Game not found" });
    }

    const game = activeGames[gameID];
    const score = game.scoreHand(selectedCards);

    res.json({ score, currentScore: game.currentScore });
};