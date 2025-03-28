const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const PokerGame = require("../Models/PokerGame");
const { StartPoker, DrawCards, ScoreHand, sortHand } = require("../Controllers/PokerController");

jest.mock("../Models/PokerGame");

let mockGameInstance;
let mockResponse;

beforeEach(() => {
    // fixed cards since we want to predict the following instances
    mockGameInstance = {
      startGame: jest.fn(),
      getPlayerHand: jest.fn().mockReturnValue([{ rank: "queen", suit: "hearts" }]),
      deck: { dealCard: jest.fn().mockReturnValue([{ rank: "10", suit: "diamonds" }]) },
      scoreHand: jest.fn().mockReturnValue(50),
      currentScore: 50,
      handsRemaining: 3,
      discardsRemaining: 2,
      gameOver: false,
      difficulty: "easy",
      targetScore: 1000,
    };
  
    PokerGame.mockImplementation(() => mockGameInstance);
  
    mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
  });

// ========================================================================

describe("StartPoker API Tests", () => {

    // 1 -- Starts the Game 

    test("StartPoker starts a new game and returns initial data", async () => {
        const req = { body: { difficulty: "easy" } };
        const res = mockResponse();

        StartPoker(req, res);

        expect(mockGameInstance.startGame).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            gameID: expect.any(Number),
            playerHand: [{ rank: "queen", suit: "hearts" }],
            handsRemaining: 3,
            discardsRemaining: 2,
            gameOver: false,
            difficulty: "easy",
            targetScore: 1000,
        });
    });

});

describe("DrawCards API Tests", () => {

    // 2 -- Returns new cards when game exists

    test("DrawCards returns new cards when game exists", () => {
        const req = { query: { gameID: "full-stack-flush", count: "1" } };
        const res = mockResponse();
    
        global.activeGames = { "full-stack-flush": mockGameInstance };
    
        mockGameInstance.deck.dealCard.mockReturnValue([{ rank: "10", suit: "diamonds" }]);
    
        DrawCards(req, res);
    
        expect(mockGameInstance.deck.dealCard).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith({ newCards: [{ rank: "10", suit: "diamonds" }] });
    });

    // 3 -- Drawing cards returns 400 if the count parameter is invalid (should be a number in a string)

    test("DrawCards returns 400 if count parameter is invalid", () => {
        const req = { query: { gameID: "full-stack-flush", count: "invalid" } };
        const res = mockResponse();
    
        global.activeGames = { "full-stack-flush": mockGameInstance };
    
        DrawCards(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid count parameter" });
    });

    // 4 -- Drawing cards returns 404 if game is not found

    test("DrawCards returns 404 if game is not found", () => {
        const req = { query: { gameID: "full-stack-flush", count: "invalid" } };
        const res = mockResponse();
    
        global.activeGames = { "full-stack-flush": undefined };
    
        DrawCards(req, res);
    
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Game not found" });
    });

});

describe("ScoreHand API Tests", () => {

    // 5 -- Returns score and updated game state

    test("ScoreHand returns score and updated game state", () => {
        const req = { body: { gameID: "full-stack-flush", selectedCards: [] } };
        const res = mockResponse();
    
        global.activeGames = { "full-stack-flush": mockGameInstance };
        ScoreHand(req, res);
    
        expect(mockGameInstance.scoreHand).toHaveBeenCalledWith([]);
        expect(res.json).toHaveBeenCalledWith({ score: 50, currentScore: 50, handsRemaining: 3, 
            discardsRemaining: 2, gameOver: false });
    });

    // 6 -- Scoring returns 404 if game not found

    test("ScoreHand returns 404 if game not found", () => {

        const req = { body: { gameID: "full-stack-flush", selectedCards: [] } };
        const res = mockResponse();
    
        global.activeGames = {};
    
        ScoreHand(req, res);
    
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Game not found" });
    });

    // 7 -- Sorting hand ranks correctly when criteria is rank 

    test("sortHand sorts by rank correctly", () => {
        const req = { body: { hand: [{ rank: "9", suit: "spades" }, 
            { rank: "ace", suit: "hearts" }], 
            criteria: "rank" } };
        const res = mockResponse();

        sortHand(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ sortedHand: [{ rank: "9", suit: "spades" }, 
            { rank: "ace", suit: "hearts" }] });
    });

    // 8 -- Sorting hand returns 400 if there is an invalid input

    test("sortHand returns 400 if there is an invalid input", () => {
        const req = { body: { hand: null, criteria: null } };
        const res = mockResponse();

        sortHand(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid request. Hand and criteria are required." });
    });

    // 9 -- Sorting hand by suit correctly ( a.suit is smaller than b.suit)

    test("sortHand sorts by suit correctly", () => {
        const req = { body: { hand: [{ rank: "10", suit: "spades" }, // spades is 'smaller' than hearts
            { rank: "jack", suit: "hearts" }], 
            criteria: "suit" } };
        const res = mockResponse();

        sortHand(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ sortedHand: [{ rank: "jack", suit: "hearts" }, 
            { rank: "10", suit: "spades" }] });
    });

    // 10 -- Sorting hand by suit correctly ( a.suit is bigger than b.suit)

    test("sortHand sorts by suit correctly when a.suit is smaller than b.suit", () => {
        const req = { body: { hand: [{ rank: "4", suit: "clubs" },  // clubs is 'smaller' than hearts
            { rank: "king", suit: "hearts" }], 
            criteria: "suit" } };
        const res = mockResponse();
    
        sortHand(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ 
            sortedHand: [{ rank: "4", suit: "clubs" }, 
            { rank: "king", suit: "hearts" }] });
    });

    // 11 - criteria is neither rank nor suit

    test("sortHand returns 400 if criteria is neither rank nor suit", () => {
        const req = { body: { hand: [{ rank: "4", suit: "hearts" }, 
            { rank: "king", suit: "spades" }], 
            criteria: "random" } };
        const res = mockResponse();

        sortHand(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid criteria. Criteria must be either rank or suit." });
    });

    // 12 -- criteria is suit and a.suit is smaller than b.suit

    test("sortHand sorts by suit correctly when a.suit is greater than b.suit", () => {
        const req = { body: { hand: [{ rank: "4", suit: "spades" },  // spades is 'greater' than hearts
            { rank: "king", suit: "hearts" }], 
            criteria: "suit" } };
        const res = mockResponse();
    
        sortHand(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ sortedHand: [{ rank: "king", suit: "hearts" }, 
            { rank: "4", suit: "spades" }] });
    });

    // 13 -- Sorting hand by suit correctly ( a.suit is equal to b.suit)

    test("sortHand does not change order when ranks are equal", () => {
        const req = { body: { hand: [{ rank: "9", suit: "spades" }, 
            { rank: "8", suit: "spades" }], 
            criteria: "suit" } };
        const res = mockResponse();
    
        sortHand(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ sortedHand: [{ rank: "9", suit: "spades" }, 
            { rank: "8", suit: "spades" }] });
    });

});