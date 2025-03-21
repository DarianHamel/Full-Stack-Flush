const PokerGame = require('../Models/PokerGame');

let activeGames = {};

/*
Start the poker game
*/
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

/*
Draw the number of cards required for the user
*/
module.exports.DrawCards = (req, res) => {
    const { gameID, count } = req.query;

    if (!activeGames[gameID]) {
        return res.status(404).json({ message: "Game not found" });
    }

    const game = activeGames[gameID];
    const newCards = game.deck.dealCard(count);

    res.json({ newCards });
};

/*
Calculate the score of the hand played
*/
module.exports.ScoreHand = (req, res) => {
    const { gameID, selectedCards } = req.body;

    if (!activeGames[gameID]) {
        return res.status(404).json({ message: "Game not found" });
    }

    const game = activeGames[gameID];
    const score = game.scoreHand(selectedCards);

    res.json({ score, currentScore: game.currentScore, handsRemaining: game.handsRemaining, discardsRemaining: game.discardsRemaining, gameOver: game.gameOver });
};

/*
Sort the cards based on the criteria input
Criteria is either rank or suit
*/
module.exports.sortHand = (req, res) => {
    const { hand, criteria } = req.body;

    if (!hand || !criteria) {
        return res.status(400).json({ message: "Invalid request. Hand and criteria are required." });
    }

    const rankOrder = {
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "8": 8,
        "9": 9,
        "10": 10,
        "Jack": 11,
        "Queen": 12,
        "King": 13,
        "Ace": 1, // ace is low to see straights easily
    };

    // Sort the hand based on the criteria
    const sortedHand = [...hand].sort((a, b) => {
        if (criteria === "rank") {
            return rankOrder[a.rank] - rankOrder[b.rank]; // Sort by rank
        } else if (criteria === "suit") {
            if (a.suit > b.suit) return 1;
            if (a.suit < b.suit) return -1;
            return 0;
        }
        return 0;
    });

    res.status(200).json({ sortedHand });
};