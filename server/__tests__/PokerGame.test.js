const PokerGame = require('../Models/PokerGame');
const Deck = require('../Models/Deck');

let pokerGameInstance;

beforeEach(() => {
    // id is the id, with difficulty easy
    pokerGameInstance = new PokerGame(1); 
});

// ========================================================================

