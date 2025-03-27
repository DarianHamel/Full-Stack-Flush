const request = require("supertest");
const app = require("../server");

describe("Poker API Integration Tests", () => {

    let gameID;

    beforeAll(async () => {
        const response = await request(app)
            .post("/poker/start")
            .send({ difficulty: "easy" });  
    
        gameID = response.body.gameID;          
    });

    test("Start a new poker game", async () => {
        const response = await request(app)
            .post("/poker/start")
            .send({ difficulty: "easy" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("gameID");
        expect(response.body).toHaveProperty("playerHand");
        expect(response.body).toHaveProperty("handsRemaining", 4);
        expect(response.body).toHaveProperty("discardsRemaining", 3);
        expect(response.body).toHaveProperty("gameOver", false);

        global.gameID = response.body.gameID;
    });

    test("Draw cards from the deck", async () => {
        global.activeGames = {
            testGameID: {
                deck: {
                    dealCard: jest.fn().mockReturnValue([
                        { rank: "Ace", suit: "Spades" },
                        { rank: "King", suit: "Hearts" },
                    ]),
                },
            },
        };
    
        const response = await request(app)
            .get("/poker/draw")
            .query({ gameID: "testGameID", count: "2" });
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("newCards");
        expect(response.body.newCards.length).toBe(2);
    });

    test("Score a poker hand", async () => {
        global.activeGames = {
            testGameID: {
                scoreHand: jest.fn().mockReturnValue(100),
                currentScore: 100,
                handsRemaining: 3,
                discardsRemaining: 2,
                gameOver: false,
            },
        };
    
        const response = await request(app)
            .post("/poker/score")
            .send({
                gameID: "testGameID",
                selectedCards: [
                    { rank: "Ace", suit: "Spades" },
                    { rank: "King", suit: "Hearts" },
                ],
            });
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("score", 100);
        expect(response.body).toHaveProperty("currentScore", 100);
        expect(response.body).toHaveProperty("handsRemaining", 3);
        expect(response.body).toHaveProperty("discardsRemaining", 2);
        expect(response.body).toHaveProperty("gameOver", false);
    });

    test("Sort a hand by rank", async () => {
        const response = await request(app)
            .post("/poker/sort-hand")
            .send({ hand: [
                { rank: "King", suit: "Hearts" },
                { rank: "3", suit: "Diamonds" },
                { rank: "Ace", suit: "Clubs" }
            ], criteria: "rank" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("sortedHand");
        expect(response.body.sortedHand[0].rank).toBe("Ace");
        expect(response.body.sortedHand[2].rank).toBe("King");
    });
});
