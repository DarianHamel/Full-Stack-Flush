//const mongoose = require("mongoose");
//const bcrypt = require("bcryptjs");
//const { MongoMemoryServer } = require("mongodb-memory-server");
//const User = require("../Models/UserModel");
//const { GetWins, GetLosses, UpdateStats } = require("../Controllers/WinLoseController");
//const WebSocket = require('ws');
const { WS } = require("jest-websocket-mock");
const { handle_web_socket } = require("../routes/Blackjack.js");
const Card = require("../models/Card.js");
const Deck = require("../models/Deck");
const Player = require("../models/Player");
const Game = require("../models/Game");
const { handleLose, handleWin } = require("../util/HandleWinLoss.js");

let server;
let client;
let game;

beforeEach(async () => {
  server = new WS('ws://localhost:5050');
  /*server.on("connection", (socket) => {
    handle_web_socket(socket, "TestUser");
  });*/
  client = new WebSocket('ws://localhost:5050');
  await server.connected;

  game = new Game();
});

afterEach(async () => {
    WS.clean();
});

//Mock these functions so they don't call during tests
jest.mock("../util/HandleWinLoss.js", () => ({
    handleLose: jest.fn(),
    handleWin: jest.fn(),
}));

// ========================================================================

describe("Deck, Card, and Player Tests", () => {

    test("Card should contain assigned values", async () => {
        const testCard =  new Card("Hearts", 8);
        expect(testCard.suit).toBe("Hearts");
        expect(testCard.rank).toBe(8);
    });

    test("Deck should be created with 52 unique cards", async () => {
        const testDeck = new Deck();
        expect(testDeck.cards.length).toBe(52);

        for (let i=0; i<52; i++){
            for (let j=0; j<52; j++){
                expect(i != j && testDeck.cards[i] === testDeck.cards[j]).toBe(false);
            }
        }
    });

    test("Player's hand should be calculated correctly", async () => {
        const testCard =  new Card("Hearts", 8);
        const testKing = new Card("Hearts", 13); //King, should be counted as a 10
        const testAce = new Card("Hearts", 14); //Ace, should be counted as an 11 or 1

        const testPlayer = new Player(null, 0, "TestUsername");
        testPlayer.hand.push(testCard);
        expect(testPlayer.get_total()).toBe(8);

        testPlayer.hand.push(testAce);
        expect(testPlayer.get_total()).toBe(19); //Ace counts as 11

        testPlayer.hand.push(testKing);
        expect(testPlayer.get_total()).toBe(19); //The Ace should only count as 1 now
    });

});

describe("Game Tests", () => {

    test("Game should correctly add players to the game and queue", async () => {
        game.add_player(client, "TestUsername");
        game.add_player(null, "TestUsername2");
        expect(game.players.length === 1 && game.playerQueue.length === 1);
    });

    test("Game should correctly tell playing and queued players that game has started", async () => {
        game.players.push(new Player(client, 1, "TestUsername"));
        game.playerQueue.push(new Player(client, 2, "TestUsername2"));
        game.start_game();
        await expect(server).toReceiveMessage(JSON.stringify({"type": "START"}));
        await expect(server).toReceiveMessage(JSON.stringify({"type": "START"}));
    });

    test("Game should correctly deal players two cards and the dealer 1", async () => {
        game.deck = new Deck();
        game.deck.cards = [new Card("Hearts", 8), new Card("Hearts", 8), new Card("Hearts", 8), new Card("Hearts", 8), new Card("Hearts", 8), new Card("Hearts", 8)];
        game.players.push(new Player(client, 1, "TestUsername"));
        game.players.push(new Player(client, 2, "TestUsername2"));

        game.deal();
        const deal1 = await server.nextMessage;
        expect(deal1.type === "DEAL" && deal1.cards.length === 2);
        const deal2 = await server.nextMessage;
        expect(deal2.type === "DEAL" && deal2.cards.length === 2);
        const deal3 = await server.nextMessage;
        expect(deal3.type === "DEALER_CARD" && deal3.cards.length === 1);
        const deal4 = await server.nextMessage;
        expect(deal4.type === "OTHER_PLAYER_DEAL" && deal4.cards.length === 2);
        const deal5 = await server.nextMessage;
        expect(deal5.type === "OTHER_PLAYER_DEAL" && deal5.cards.length === 2);
    });

    test("Game should end if dealer has natural", async () => {
        game.deck = new Deck();
        game.deck.cards = [new Card("Hearts", 14), new Card("Hearts", 8), new Card("Hearts", 10), new Card("Hearts", 8)];
        game.players.push(new Player(client, 1, "TestUsername"));

        game.deal();
        const deal1 = await server.nextMessage;
        console.log(game.deck);
        const deal2 = await server.nextMessage;
        console.log(game.deck);
        expect(deal2.type === "DEALER_CARD" && deal2.cards.length === 1);
        const deal3 = await server.nextMessage;
        console.log(game.deck);
        expect(deal3.type === "DEALER_CARD" && deal3.cards.length === 2);
        const deal4 = await server.nextMessage;
        console.log(game.deck);
        expect(deal4.type === "GAME_OVER" && deal4.cards.length === 2);
    });

    
});

