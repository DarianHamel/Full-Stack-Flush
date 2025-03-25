const request = require("supertest");
const app = require("../server");
const { blackjackState, assign_player, remove_player, handle_message } = require("../routes/Blackjack");
const Game = require("../Models/Game");
const Player = require("../Models/Player");

jest.setTimeout(80000); 

describe("Blackjack Integration Tests", () => {
  let game;
  let player1, player2;
  let ws1, ws2;

  beforeEach(() => {
    // Reset the game state before each test
    blackjackState.games = [];
    blackjackState.gameIdCounter = 0;

    // Mock WebSocket objects
    ws1 = { send: jest.fn(), close: jest.fn() };
    ws2 = { send: jest.fn(), close: jest.fn() };

    // Mock players
    player1 = new Player(ws1, 1, "player1", 10, false);
    player2 = new Player(ws2, 2, "player2", 20, false);
  });

  test("Start a new game and add players", async () => {
    // Assign players to a new game
    game = assign_player(ws1, "player1", 10, false);
    assign_player(ws2, "player2", 20, false);

    // Verify the game state
    expect(game.players.length).toBe(2);
    expect(game.started).toBe(true);
    expect(game.players[0].username).toBe("player1");
    expect(game.players[1].username).toBe("player2");
  });

  test("Handle player HIT action", async () => {
    // Assign a player to a new game
    game = assign_player(ws1, "player1", 10, false);

    // Simulate a HIT action
    game.handle_action("HIT", ws1, 10);

    // Verify the player's hand has increased by one card
    expect(game.players[0].hand.length).toBe(3);
  });

  test("Handle player STAND action", async () => {
    // Assign a player to a new game
    game = assign_player(ws1, "player1", 10, false);

    // Simulate a STAND action
    game.handle_action("STAND", ws1, 10);

    // Verify the turn moves to the next player or the dealer
    expect(game.playingPlayer).toBe(1);
  });

  test("Handle dealer's turn", async () => {
    // Assign a player to a new game
    game = assign_player(ws1, "player1", 10, false);

    // Simulate all players standing
    game.handle_action("STAND", ws1, 10);

    // Verify the dealer draws cards until their hand total is at least 17
    expect(game.dealer.get_total()).toBeGreaterThanOrEqual(17);
  });

  test("Determine game outcome (player wins)", async () => {
    // Assign a player to a new game
    game = assign_player(ws1, "player1", 10, false);

    // Simulate player and dealer hands
    game.players[0].hand = [
      { suit: "hearts", rank: 10 },
      { suit: "hearts", rank: 9 },
    ];
    game.dealer.hand = [
      { suit: "spades", rank: 5 },
      { suit: "spades", rank: 10 },
    ];

    // End the game
    game.end_game();

    // Verify the player wins
    expect(ws1.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "GAME_OVER", result: "WIN" })
    );
  });

  test("Determine game outcome (player loses)", async () => {
    // Assign a player to a new game
    game = assign_player(ws1, "player1", 10, false);

    // Simulate player and dealer hands
    game.players[0].hand = [
      { suit: "hearts", rank: 10 },
      { suit: "hearts", rank: 6 },
    ];
    game.dealer.hand = [
      { suit: "spades", rank: 10 },
      { suit: "spades", rank: 7 },
    ];

    // End the game
    game.end_game();

    // Verify the player loses
    expect(ws1.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "GAME_OVER", result: "LOSE", fakeMoney: false })
    );
  });

  test("Handle player disconnection", async () => {
    // Assign players to a new game
    game = assign_player(ws1, "player1", 10, false);
    assign_player(ws2, "player2", 20, false);

    // Simulate player1 disconnecting
    remove_player(ws1);

    // Verify the player is removed from the game
    expect(game.players.length).toBe(1);
    expect(game.players[0].username).toBe("player2");
  });

  test("Handle PLAY_AGAIN action", async () => {
    // Assign a player to a new game
    game = assign_player(ws1, "player1", 10, false);

    // Simulate the game ending
    game.gameOver = true;

    // Simulate a PLAY_AGAIN action
    game.handle_action("PLAY_AGAIN", ws1, 10);

    // Verify the game restarts
    expect(game.started).toBe(true);
    expect(game.players[0].hand.length).toBe(2);
  });

  test("Handle bet validation (insufficient balance)", async () => {
    // Mock the bet controller to return insufficient balance
    jest.spyOn(request(app), "post").mockResolvedValueOnce({
      status: 400,
      body: { message: "Insufficient balance" },
    });

    // Simulate a player placing a bet
    const response = await request(app)
      .post("/bet")
      .send({ username: "player1", money: 1000 });

    // Verify the bet is rejected
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient balance");
  });

  test("Handle fake money bets", async () => {
    // Assign a player to a new game with fake money
    game = assign_player(ws1, "player1", 10, true);

    // Simulate a PLAY_AGAIN action with fake money
    game.handle_action("PLAY_AGAIN", ws1, 0);

    // Verify the game restarts without affecting the player's real balance
    expect(game.started).toBe(true);
    expect(game.players[0].fakeMoney).toBe(true);
  });
});