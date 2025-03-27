const Deck = require('../Models/Deck.js');
const Card = require('../Models/Card.js');

let deckInstance;

beforeEach(() => {
    deckInstance = new Deck();
});

// ========================================================================

describe("Deck Class Tests", () => {

    // 1 -- Initialize Deck

    test("Deck initializes with 52 cards", () => {
        expect(deckInstance.cards.length).toBe(52);
    });

    // 2 -- Shuffle Deck

    test("Deck shuffles cards", () => {
        const originalCards = [...deckInstance.cards];
        deckInstance.shuffle();
        expect(deckInstance.cards).not.toEqual(originalCards);
    });

    // 3 -- Change Card

    test("Deck changes card rank on Ace", () => {
        const card = new Card("spades", 14);
        const changedCard = deckInstance.changeCard(card);
        expect(changedCard.rank).toBe("Ace");
    });

    test("Deck changes card rank on Jack", () => {
        const card = new Card("diamons", 11);
        const changedCard = deckInstance.changeCard(card);
        expect(changedCard.rank).toBe("Jack");
    });

    test("Deck changes card rank", () => {
        const card = new Card("hearts", 12);
        const changedCard = deckInstance.changeCard(card);
        expect(changedCard.rank).toBe("Queen");
    });

    test("Deck changes card rank", () => {
        const card = new Card("clubs", 13);
        const changedCard = deckInstance.changeCard(card);
        expect(changedCard.rank).toBe("King");
    });

    // 4 -- Deal Cards

    test("Deck deals multiple cards", () => {
        const cards = deckInstance.dealCard(5);
        expect(cards.length).toBe(5);
    });

});