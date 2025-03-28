const PokerGame = require("../Models/PokerGameModel");
const Deck = require("../Models/DeckModel");

jest.mock("../Models/DeckModel");

let pokerGame;

beforeEach(() => {
    Deck.mockClear();
    Deck.prototype.dealCard = jest.fn((num) => Array(num).fill({ rank: "Ace", suit: "Spades" }));
    pokerGame = new PokerGame("game1", "easy");
});

describe("PokerGame", () => {

    // 1 -- Constructor of PokerGame

    test("should initialize with correct default values", () => {
        expect(pokerGame.id).toBe("game1");
        expect(pokerGame.difficulty).toBe("easy");
        expect(pokerGame.started).toBe(false);
        expect(pokerGame.gameOver).toBe(false);
        expect(pokerGame.playerHand).toEqual([]);
        expect(pokerGame.currentScore).toBe(0);
        expect(pokerGame.handsRemaining).toBe(4);
        expect(pokerGame.discardsRemaining).toBe(3);
        expect(pokerGame.targetScore).toBe(200);
    });

    // 2 -- Start the game of poker

    test("should start the game and deal cards", () => {
        pokerGame.startGame();
        expect(pokerGame.started).toBe(true);
        expect(pokerGame.playerHand.length).toBe(8);
        expect(pokerGame.targetScore).toBe(500);
    });

    // 3 -- Return the array of cards in the player's hand

    test("should return the player's hand", () => {
        pokerGame.startGame();
        expect(pokerGame.getPlayerHand().length).toBe(8);
    });

    // 4 -- Score the hand played

    test("should score a hand correctly", () => {
        const hand = [
            { rank: "Ace", suit: "Spades" },
            { rank: "King", suit: "Spades" },
            { rank: "Queen", suit: "Spades" },
            { rank: "Jack", suit: "Spades" },
            { rank: "10", suit: "Spades" },
        ];
        const result = pokerGame.scoreHand(hand);
        expect(result).toContain("Straight Flush");
        expect(pokerGame.currentScore).toBeGreaterThan(0);
        expect(pokerGame.handsRemaining).toBe(3);
    });

    // 5 -- Discard cards

    test("should handle discarding cards", () => {
        pokerGame.startGame();
    
        pokerGame.playerHand = [
            { rank: "2", suit: "Hearts" },
            { rank: "3", suit: "Hearts" },
            { rank: "4", suit: "Hearts" },
            { rank: "5", suit: "Hearts" },
            { rank: "6", suit: "Hearts" },
            { rank: "7", suit: "Hearts" },
            { rank: "8", suit: "Hearts" },
            { rank: "9", suit: "Hearts" },
        ];
    
        const initialHand = [...pokerGame.playerHand];
        const cardsToDiscard = initialHand.slice(0, 2); 
    
        Deck.prototype.dealCard = jest.fn((num) =>
            Array.from({ length: num }, (_, i) => ({ rank: `${i + 10}`, suit: "Diamonds" }))
        );
    
        const result = pokerGame.discardCards(cardsToDiscard);
    
        expect(result).toBe("Cards discarded successfully.");
        expect(pokerGame.playerHand.length).toBe(8);
        expect(pokerGame.discardsRemaining).toBe(2); 
        expect(pokerGame.playerHand).not.toContainEqual(cardsToDiscard[0]); 
        expect(pokerGame.playerHand).not.toContainEqual(cardsToDiscard[1]);
    });

    test("should not allow discarding when no discards remain", () => {
        pokerGame.startGame();
        pokerGame.discardsRemaining = 0;
        const result = pokerGame.discardCards([{ rank: "Ace", suit: "Spades" }]);
        expect(result).toBe("No discards remaining.");
    });

    // 6 -- End the game

    test("should end the game", () => {
        pokerGame.endGame();
        expect(pokerGame.gameOver).toBe(true);
    });

    test("should return 'Game Over' when scoring with no hands remaining", () => {
        pokerGame.handsRemaining = 0;
        const result = pokerGame.scoreHand([]);
        expect(result).toBe("Game Over");
        expect(pokerGame.gameOver).toBe(true);
    });
});