const request = require("supertest");
const app = require("../server");

let gameID;

beforeAll(async () => {
    // Start a new poker game
    const response = await request(app)
        .post("/poker/start")
        .send({ difficulty: "easy" });  // Adjust difficulty as needed

    gameID = response.body.gameID;   // Store the gameID for use in tests
    global.gameID = gameID;           // Assign it to global.gameID for your tests
});


describe("Poker API Integration Tests", () => {

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
        const response = await request(app)
            .get("/poker/draw")
            .query({ gameID: global.gameID, count: 2 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("newCards");
        expect(response.body.newCards.length).toBe(2);
    });

    test("Score a poker hand", async () => {
        const response = await request(app)
            .post("/poker/score")
            .send({ gameID: global.gameID, selectedCards: [{ rank: "Ace", suit: "Spades" }] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("score");
        expect(response.body).toHaveProperty("currentScore");
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
