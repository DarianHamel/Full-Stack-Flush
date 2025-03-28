const Game = require("../Models/Game.js");
const Player = require("../Models/Player.js");
const Deck = require("../Models/Deck.js");

jest.mock("../Models/Player.js");
jest.mock("../Models/Deck.js");

let gameInstance;

beforeEach(() => {
  gameInstance = new Game(1);
  gameInstance.players = []; 
  Deck.mockImplementation(() => ({
    cards: [
      { suit: "hearts", rank: "10" },
      { suit: "spades", rank: "ace" },
      { suit: "diamonds", rank: "7" },
      { suit: "clubs", rank: "king" },
    ],
  }));

  Player.mockImplementation((websocket, id, name, bet, isDealer) => ({
    ws: websocket,
    id,
    name,
    bet,
    isDealer,
    hand: [],
    get_total: jest.fn(() => 0),
  }));
});

const mockWebsocket = {
  send: jest.fn(),
  close: jest.fn(),
};

//=====================================================

describe("Game Model API Tests", () => {

    // 1 -- add_player function 

    test("add_player adds the player to a game if a game is not started yet", () => {
        gameInstance.start_game = jest.fn();
        gameInstance.started = false;
        gameInstance.add_player(mockWebsocket, "full-stack-flush", 10, false);

        expect(gameInstance.players.length).toBe(1);
        expect(gameInstance.players[0].name).toBe("full-stack-flush");
        expect(gameInstance.start_game).toHaveBeenCalledTimes(1);
    });

    test("add_player queues the player if a game is already started", () => {
        gameInstance.started = true;
        gameInstance.add_player(mockWebsocket, "full-stack-flush-2", 12, false);

        expect(gameInstance.playerQueue.length).toBe(1);
        expect(gameInstance.playerQueue[0].name).toBe("full-stack-flush-2");
    });

    // 2 -- deal function 

    test("deal assigns 2 cards to each player and dealer", () => {
        gameInstance.players.push(new Player(mockWebsocket, 1, "full-stack-flush-3", 21, false));
        gameInstance.dealer = new Player(mockWebsocket, 2, "dealer", 0, true);
        gameInstance.start_game();

        expect(gameInstance.players[0].hand.length).toBe(2);
        expect(gameInstance.dealer.hand.length).toBe(2);
    });

    test("deal assigns 2 cards to each player and dealer", () => {
        gameInstance.players.push(new Player(mockWebsocket, 1, "full-stack-flush-3", 21, false));
        gameInstance.dealer = new Player(mockWebsocket, 0, "Dealer", 0, true);

        gameInstance.dealer.hand = [
          { suit: "hearts", rank: "10" },
          { suit: "spades", rank: "ace" },
        ];
        gameInstance.start_game();

        expect(gameInstance.players[0].hand.length).toBe(2);
        expect(gameInstance.dealer.hand.length).toBe(2);
    });

    // 3 -- next_turn function

    test("next_turn switches to the next player correctly", async () => {
        gameInstance.players.push(new Player(mockWebsocket, 1, "player1", 10, false));
        gameInstance.players.push(new Player(mockWebsocket, 2, "player2", 15, false));
        gameInstance.playingPlayer = 0;
    
        await gameInstance.next_turn();
    
        expect(gameInstance.playingPlayer).toBe(1);  // Player 2 should be next
    });
    
    test("next_turn resets to 0 after the last player", () => {
        gameInstance.players.push(new Player(mockWebsocket, 1, "player1", 10, false));
        gameInstance.players.push(new Player(mockWebsocket, 2, "player2", 15, false));
        gameInstance.playingPlayer = 1;  // Player 2 is the last one
    
        gameInstance.next_turn();

        expect(gameInstance.playingPlayer).toBe(0);  // Should reset to player 1
    });

    // 4 -- dealer_turn function

    test("dealer_turn hits until total is 17 or more", () => {
        gameInstance.dealer = new Player(mockWebsocket, 0, "Dealer", 0, true);

        // Initialize the dealer's hand
        gameInstance.dealer.hand = [
          { suit: "hearts", rank: "10" },
          { suit: "spades", rank: "ace" },
        ];
      
        // Mock the dealer's get_total method
        gameInstance.dealer.get_total
          .mockReturnValueOnce(16) // First call: dealer's total is 16
          .mockReturnValueOnce(18); // Second call: dealer's total is 18
      
        // Initialize the deck
        gameInstance.deck = new Deck();
      
        // Call dealer_turn
        gameInstance.dealer_turn();
      
        // Verify that the dealer drew at least one card
        expect(gameInstance.dealer.hand.length).toBeGreaterThan(0);
    });

    // 5 -- handle_Action function

    test("handle_action processes a hit correctly", () => {
        const player = new Player(mockWebsocket, 1, "player1", 10, false);
        player.hand = [{ suit: "hearts", rank: "2" }, { suit: "spades", rank: "ace" }];
        gameInstance.players.push(player);
        gameInstance.playingPlayer = 0;
        gameInstance.deck = new Deck();

        gameInstance.handle_action("HIT", mockWebsocket);

        expect(player.hand.length).toBe(3); // Assuming the player had 2 cards before
        expect(mockWebsocket.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: "DEAL_SINGLE",
                card: { suit: "clubs", rank: "king" }, // Assuming the last card in the mock deck
            })
        );
    });
        


    

    // 6 -- remove_player function

    test("remove_player removes a player by ID", () => {
        gameInstance.players.push(new Player(mockWebsocket, 1, "player1", 10, false));
        gameInstance.players.push(new Player(mockWebsocket, 2, "player2", 15, false));

        const result = gameInstance.remove_player(mockWebsocket);
        console.log(gameInstance.players);

        expect(result).toBe(true);
        expect(gameInstance.players.length).toBe(1);
    });

    // 7 -- play_again function

    test("handle_action processes play again correctly", async () => {
        // Create a player and add them to the game
        const player = new Player(mockWebsocket, 1, "player1", 10, false);
        player.hand = [{ suit: "hearts", rank: "2" }, { suit: "spades", rank: "ace" }];
        gameInstance.players.push(player);
        gameInstance.playersPlayingAgain = 0;
    
        // Set the game state
        gameInstance.gameOver = true;
        gameInstance.players.length = 10;
    
        // Call handle_action with "PLAY_AGAIN"
        await gameInstance.handle_action("PLAY_AGAIN", mockWebsocket);
    
        // Verify that the WebSocket sent the correct message
        expect(mockWebsocket.send).toHaveBeenCalledWith(
            "{\"type\":\"TREND_CHANGE\",\"message\":null}"
        );
        expect(mockWebsocket.send).toHaveBeenCalledWith(
            "{\"type\":\"START\"}"
        );
        expect(mockWebsocket.send).toHaveBeenCalledWith(
            "{\"type\":\"DEAL\",\"cards\":[{\"suit\":\"clubs\",\"rank\":\"king\"},{\"suit\":\"spades\",\"rank\":\"ace\"}]}"
        );        
    
        // Verify that the player is marked as wanting to play again
        expect(gameInstance.playersPlayingAgain).toBe(1);
    
        // Verify that the game restarts if all players want to play again
        expect(gameInstance.started).toBe(true);
        expect(gameInstance.gameOver).toBe(false);
    });
    

});