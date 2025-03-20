const PokerGame = require('../Models/PokerGame');

let activeGames = {};

module.exports.StartPoker = (req, res) => {
    const { difficulty } = req.body;
    const gameID = Date.now(); // should change to username tracking probably ?
    const newGame = new PokerGame(gameID, difficulty);
    newGame.startGame();

    console.log(gameID);
    activeGames[gameID] = newGame;

    res.json({
        gameID,
        playerHand: newGame.getPlayerHand(),
        handsRemaining: newGame.handsRemaining,
        discardsRemaining: newGame.discardsRemaining,
        gameOver: newGame.gameOver,
        difficulty: newGame.difficulty,
        targetScore: newGame.targetScore
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

    res.json({ score, currentScore: game.currentScore, handsRemaining: game.handsRemaining, discardsRemaining: game.discardsRemaining, gameOver: game.gameOver });
};