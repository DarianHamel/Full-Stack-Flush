const { WS } = require("jest-websocket-mock");
const { handle_web_socket, blackjackState, assign_player, remove_player, handle_message } = require("../routes/Blackjack.js");
const Card = require("../Models/Card.js");
const Deck = require("../Models/Deck");
const Player = require("../Models/Player");
const Game = require("../Models/Game");
const { handleLose, handleWin } = require("../util/HandleWinLoss.js");
const { handleBet } = require("../util/HandleBet.js");

let server;
let client;
let game;

beforeEach(async () => {
  server = new WS('ws://localhost:5050');
  client = new WebSocket('ws://localhost:5050');
  await server.connected;

  game = new Game();
  blackjackState.games = [];
  blackjackState.gameIdCounter = 0;
});

afterEach(async () => {
    WS.clean();
});

//Mock these functions so they don't call during tests
jest.mock("../util/HandleWinLoss.js", () => ({
    handleLose: jest.fn(),
    handleWin: jest.fn(),
}));

jest.mock("../util/HandleBet.js", () => ({
    handleBet: jest.fn(),
}))

// ========================================================================

describe("Deck, Card, and Player Tests", () => {

    test("Card should contain assigned values", async () => {
        const testCard =  new Card("Hearts", 8);
        expect(testCard.suit).toBe("Hearts");
        expect(testCard.rank).toBe(8);
    });

    test("Deck should be created with 52 unique and valid cards", async () => {
        const testDeck = new Deck();
        expect(testDeck.cards.length).toBe(52);

        for (let i=0; i<52; i++){
            for (let j=0; j<52; j++){
                expect(i != j && testDeck.cards[i] === testDeck.cards[j]).toBe(false);
            }

            expect(testDeck.cards[i].rank >= 2 && testDeck.cards[i].rank <= 14).toBe(true);
            expect(testDeck.cards[i].suit === 'hearts' || testDeck.cards[i].suit === 'diamonds' || testDeck.cards[i].suit === 'clubs' || testDeck.cards[i].suit === 'spades').toBe(true);
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
        expect(game.players.length).toBe(1);
        expect(game.playerQueue.length).toBe(1);
    });

    test("Game should correctly remove players to the game and queue", async () => {
        const testWebsocket = new WebSocket('ws://localhost:5050');
        game.add_player(client, "TestUsername");
        game.add_player(testWebsocket, "TestUsername2");
        expect(game.players.length).toBe(1);
        expect(game.playerQueue.length).toBe(1);

        game.remove_player(testWebsocket);
        game.remove_player(client);
        expect(game.players.length).toBe(0);
        expect(game.playerQueue.length).toBe(0);
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
        game.players.push(new Player(client, 1, "TestUsername", 1));
        game.players.push(new Player(client, 2, "TestUsername2", 1));

        game.deal();
        const deal1 = JSON.parse(await server.nextMessage);
        expect(deal1.type).toBe("DEAL")
        expect(deal1.cards.length).toBe(2);

        const deal2 = JSON.parse(await server.nextMessage);
        expect(deal2.type).toBe("DEAL")
        expect(deal2.cards.length).toBe(2);

        const deal3 = JSON.parse(await server.nextMessage);
        expect(deal3.type).toBe("DEALER_CARD")

        const deal4 = JSON.parse(await server.nextMessage);
        expect(deal4.type).toBe("DEALER_CARD")

        const deal5 = JSON.parse(await server.nextMessage);
        expect(deal5.type).toBe("OTHER_PLAYER_DEAL")
        expect(deal5.cards.length).toBe(2);

        const deal6 = JSON.parse(await server.nextMessage);
        expect(deal6.type).toBe("OTHER_PLAYER_DEAL")
        expect(deal6.cards.length).toBe(2);
    });

    test("Game should end if dealer has natural", async () => {
        game.deck = new Deck();
        game.deck.cards = [new Card("Hearts", 14), new Card("Hearts", 8), new Card("Hearts", 10), new Card("Hearts", 8)];
        game.players.push(new Player(client, 1, "TestUsername", 1));

        game.deal();
        const deal1 = JSON.parse(await server.nextMessage);
        expect(deal1.type).toBe("DEAL")
        expect(deal1.cards.length).toBe(2);

        const deal2 = JSON.parse(await server.nextMessage);
        expect(deal2.type).toBe("DEALER_CARD")

        const deal3 = JSON.parse(await server.nextMessage);
        expect(deal3.type).toBe("DEALER_CARD")

        const gameOver = JSON.parse(await server.nextMessage);
        expect(gameOver.type).toBe("GAME_OVER")
    });


    test("Game should calculate winners correctly", async () => {
        const testWinner = new Player(client, 0, "TestWinner",1 );
        testWinner.hand = [new Card('Hearts', 14), new Card('Hearts', 10)]; //has 21, should win

        const testLoser = new Player(client, 0, "TestLoser", 1);
        testLoser.hand = [new Card('Hearts', 2), new Card('Hearts', 10), new Card('Hearts', 11)]; //has 22, should lose

        const testLoser2 = new Player(client, 0, "TestLoser2", 1);
        testLoser2.hand = [new Card('Hearts', 10), new Card('Hearts', 6)]; //has 16, should lose

        const testNeutral = new Player(client, 0, "TestNeutral", 1);
        testNeutral.hand = [new Card('Hearts', 7), new Card('Hearts', 10)]; //has 17, should be neutral

        game.dealer.hand = [new Card('Hearts', 7), new Card('Hearts', 10)]; //Dealer has 17
        game.players.push(testWinner);
        game.players.push(testLoser);
        game.players.push(testLoser2);
        game.players.push(testNeutral);

        game.end_game();
        await expect(server).toReceiveMessage(JSON.stringify({type: "GAME_OVER", result: "WIN"}));
        await expect(server).toReceiveMessage(JSON.stringify({type: "GAME_OVER", result: "LOSE"}));
        await expect(server).toReceiveMessage(JSON.stringify({type: "GAME_OVER", result: "LOSE"}));
        await expect(server).toReceiveMessage(JSON.stringify({type: "GAME_OVER", result: "NEUTRAL"}));
    });
    
    test("Game should tell player if they hit 21 on a HIT", async () => {

        //mock next_turn so it doesn't get called
        const nextTurnSpy = jest.spyOn(game, 'next_turn').mockImplementation(() => {});

        const testPlayer = new Player(client, 0, "TestPlayer", 1);
        testPlayer.hand = [new Card('Hearts', 10)]
        game.players.push(testPlayer);
        game.deck = new Deck();
        game.deck.cards = [new Card('Hearts', 14)];

        game.handle_action("HIT", client);
        
        let msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("DEAL_SINGLE");
        msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("TWENTY_ONE");

        nextTurnSpy.mockRestore();
    });

    test("Game should tell player if they bust on a HIT", async () => {

        //mock next_turn so it doesn't get called
        const nextTurnSpy = jest.spyOn(game, 'next_turn').mockImplementation(() => {});

        const testPlayer = new Player(client, 0, "TestPlayer", 1);
        testPlayer.hand = [new Card('Hearts', 10), new Card('Hearts', 10)];
        game.players.push(testPlayer);
        game.deck = new Deck();
        game.deck.cards = [new Card('Hearts', 10)];

        game.handle_action("HIT", client);
        
        let msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("DEAL_SINGLE");
        msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("BUST");

        nextTurnSpy.mockRestore();
    });

    test("Game should tell player other player's new card on a HIT", async () => {

        const testPlayer = new Player(client, 0, "TestPlayer", 1);
        const testPlayer2 = new Player(client, 0, "TestPlayer2", 1);
        testPlayer.hand = [new Card('Hearts', 2), new Card('Hearts', 2)];
        game.players.push(testPlayer);
        game.players.push(testPlayer2);
        game.deck = new Deck();
        game.deck.cards = [new Card('Hearts', 10)];

        game.handle_action("HIT", client);
        
        let msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("DEAL_SINGLE");
        msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("OTHER_PLAYER_DEAL_SINGLE");
        expect(msg.card.suit).toBe("Hearts");
        expect(msg.card.rank).toBe(10);

    });

    test("Game should accurately tell players which cards the dealer gets", async () => {

        //mock end_game so it doesn't get called
        const endGameSpy = jest.spyOn(game, 'end_game').mockImplementation(() => {});

        const testPlayer = new Player(client, 0, "TestPlayer", 1);
        game.players.push(testPlayer);
        game.deck = new Deck();
        game.deck.cards = [new Card('Hearts', 2), new Card('Hearts', 5)];
        game.dealer.hand = [new Card('Hearts', 2), new Card('Hearts', 8)]; //Dealer has 10

        game.dealer_turn();
        
        let msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("DEALER_CARD");
        expect(msg.card.suit).toBe("Hearts");
        expect(msg.card.rank).toBe(8);

        msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("DEALER_CARD");
        expect(msg.card.suit).toBe("Hearts");
        expect(msg.card.rank).toBe(5);

        msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("DEALER_CARD");
        expect(msg.card.suit).toBe("Hearts");
        expect(msg.card.rank).toBe(2);

        endGameSpy.mockRestore();
    });

    test("Game should tell the next player it's their turn when a player calls STAND", async () => {

        const testWebsocket = new WebSocket('ws://localhost:5050');
        const testPlayer = new Player(testWebsocket, 0, "TestPlayer", 1);
        const testPlayer2 = new Player(client, 0, "TestPlayer2", 1);
        game.players.push(testPlayer);
        game.players.push(testPlayer2);

        game.handle_action("STAND", testWebsocket);
        
        let msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("PLAYER_TURN");
    });

    test("Game should restart the game when PLAY_AGAIN is called", async () => {

        const testPlayer = new Player(client, 0, "TestPlayer", 1);
        game.players.push(testPlayer);
        game.gameOver = true;

        game.handle_action("PLAY_AGAIN", client);
        
        let msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("TREND_CHANGE");
        msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("START");

    });

    test("Game should close the socket when a player is kicked", async () => {
        game.deck = new Deck();

        const testPlayer = new Player(client, 0, "TestPlayer", 1);
        game.players.push(testPlayer);

        game.kick_player(client);
        
        await server.closed;
        expect(client.readyState).toBe(WebSocket.CLOSED);
    });
});

describe("Blackjack Routes Tests", () => {

    test("Game should be created and started when the first player joins", async () => {

        assign_player(client, "TestPlayer", 1);
        let msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("START");
    });

    test("A new game should be created and started when the first one is full", async () => {

        const game1 = assign_player(client, "TestPlayer", 1);
        assign_player(client, "TestPlayer2", 1);
        assign_player(client, "TestPlayer3", 1);
        assign_player(client, "TestPlayer4", 1);
        const game2 = assign_player(client, "TestPlayer5", 1);

        expect(game1 === game2).toBe(false);

    });

    test("Blackjack should remove players successfully", async () => {

        const game1 = assign_player(client, "TestPlayer", 1);
        remove_player(client);

        expect(game1.players.length).toBe(0);

    });

    test("Blackjack should send messages correctly", async () => {
        //This is quite a finicky test
        const game1 = assign_player(client, "TestPlayer", 1);
        
        let msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("START");
        msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("DEAL");
        msg = JSON.parse(await server.nextMessage);
        expect(msg.type).toBe("DEALER_CARD");
        msg = JSON.parse(await server.nextMessage);

        //Change which message is sent based on the state of the game
        if (game1.dealer.get_total() === 21 || game1.players[0].get_total() === 21){
            while (msg.type === "DEALER_CARD"){
                expect(msg.type).toBe("DEALER_CARD");
                msg = JSON.parse(await server.nextMessage);
            }
            expect(msg.type).toBe("GAME_OVER");

            const message = {
                type: "ACTION",
                action: "PLAY_AGAIN",
            };

            const bet = 1;
            handle_message(message, client, "TestPlayer", bet);
    
            msg = JSON.parse(await server.nextMessage);
            expect(msg.type).toBe("START");
        }
        else{
            expect(msg.type).toBe("PLAYER_TURN");

            const message = {
                type: "ACTION",
                action: "HIT",
            };

            const bet = 1;
            handle_message(message, client);
    
            msg = JSON.parse(await server.nextMessage);
            expect(msg.type).toBe("DEAL_SINGLE");
        }
    });

    test("Blackjack should handle bad messages correctly", async () => {

        assign_player(client, "TestPlayer", 1);
        
        handle_message("BAD MESSAGE", client);

        await server.closed;
        expect(client.readyState).toBe(WebSocket.CLOSED);
    });

});

