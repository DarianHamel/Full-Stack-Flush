const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const History = require("../Models/HistoryModel");
const { 
  getWins, 
  getLosses, 
  updateStats,
  handleTransaction 
} = require("../Controllers/WinLoseController");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany();
  await History.deleteMany();
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mocking User methods
User.prototype.updateMoneyWon = jest.fn().mockImplementation(function(amount) {
    this.balance += Number(amount);
    return this.save();
});
  
  User.prototype.updateMoneySpent = jest.fn().mockImplementation(function(amount) {
    this.dailyMoneySpent += Number(amount);
    this.moneySpent += Number(amount);
    return this.save();
});


describe("getWins API Tests", () => {
  test("returns correct win count for valid user", async () => {
    await User.create({ 
        username: "testUser", 
        password: "testPass",
        wins: 5 
    });

    const req = { query: { username: "testUser" } };
    const res = mockResponse();

    await getWins(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ wins: 5 });
  });

  test("returns 404 if user not found", async () => {
    const req = { query: { username: "nonexistent" } };
    const res = mockResponse();

    await getWins(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("handles database errors", async () => {
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("DB error"));
    const req = { query: { username: "test" } };
    const res = mockResponse();

    await getWins(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    User.findOne.mockRestore();
  });
});


describe("getLosses API Tests", () => {
  test("returns correct loss count for valid user", async () => {
    await User.create({ 
        username: "testUser",
        password: "testPass",
        losses: 3 
    });

    const req = { query: { username: "testUser" } };
    const res = mockResponse();

    await getLosses(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ losses: 3 });
  });

  test("returns 404 if user not found", async () => {
    const req = { query: { username: "nonexistent" } };
    const res = mockResponse();

    await getLosses(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("handles database errors", async () => {
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("DB error"));
    const req = { query: { username: "test" } };
    const res = mockResponse();

    await getLosses(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    User.findOne.mockRestore();
  });
});


describe("updateStats API Tests", () => {
  let user;
  
  beforeEach(async () => {
    user = await User.create({ 
      username: "testUser",
      password: "testPass",
      balance: 1000,
      wins: 5,
      losses: 3,
      moneySpent: 50
    });

    // Clear all mock implementations before each test
    User.prototype.updateMoneyWon.mockClear();
    User.prototype.updateMoneySpent.mockClear();
  });

  test("updates wins and losses successfully", async () => {
    const req = { 
      body: { 
        username: "testUser",
        wins: 2,
        losses: 1,
        game: "Blackjack"
      } 
    };
    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      wins: 7,
      losses: 4
    });
  });

  test("updates wins only when losses not provided", async () => {
    const req = {
      body: {
        username: "testUser",
        wins: 3,
        game: "Poker"  
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      wins: 8,
      losses: 3
    });
  });

  test("updates losses only when wins not provided", async () => {
    const req = {
      body: {
        username: "testUser",
        losses: 2,
        game: "Blackjack"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      wins: 5,
      losses: 5
    });
  });

  test("creates history record when money is provided", async () => {
    const req = {
      body: {
        username: "testUser",
        wins: 1,
        money: 50,
        game: "Poker",
        day: "2023-01-01"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    const history = await History.findOne();
    expect(history).toBeTruthy();
    expect(history.transaction).toBe(50);
  });

  test("creates negative history record when losses occur", async () => {
    const req = {
      body: {
        username: "testUser",
        losses: 1,
        money: 50,
        game: "Blackjack",
        day: "2023-01-01"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    const history = await History.findOne();
    expect(history.transaction).toBe(-50);
  });

  test("updates balance when wins and money provided", async () => {
    const initialBalance = user.balance;
    const moneyToAdd = 75;
    
    const req = {
      body: {
        username: "testUser",
        wins: 1,
        money: moneyToAdd,
        game: "Poker"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    // Verifying the method was called with the right amount
    expect(User.prototype.updateMoneyWon).toHaveBeenCalledWith(moneyToAdd);
    
    // Verifying the user's balance was updated in the database
    const updatedUser = await User.findOne({ username: "testUser" });
    expect(updatedUser.balance).toBe(initialBalance + moneyToAdd);
  });

  test("updates moneySpent when losses and money provided", async () => {
    const initialMoneySpent = user.moneySpent;
    const moneyToSpend = 25;
    
    const req = {
      body: {
        username: "testUser",
        losses: 1,
        money: moneyToSpend,
        game: "Blackjack"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    const updatedUser = await User.findOne();
    expect(updatedUser.moneySpent).toBe(initialMoneySpent + moneyToSpend);
  });

  test("returns 400 for negative wins", async () => {
    const req = {
      body: {
        username: "testUser",
        wins: -1,
        game: "Poker"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid values"
    });
  });

  test("returns 400 for negative losses", async () => {
    const req = {
      body: {
        username: "testUser",
        losses: -1,
        game: "Blackjack"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid values"
    });
  });

  test("returns 400 for invalid game", async () => {
    const req = {
      body: {
        username: "testUser",
        wins: 1,
        game: "InvalidGame"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Game not found"
    });
  });

  test("returns 400 when username missing", async () => {
    const req = {
      body: {
        wins: 1,
        game: "Poker"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid request. Provide a username."
    });
  });

  test("returns 404 when user not found", async () => {
    const req = {
      body: {
        username: "nonexistent",
        wins: 1,
        game: "Blackjack"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found"
    });
  });

  test("handles database errors", async () => {
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("DB error"));
    const req = {
      body: {
        username: "testUser",
        wins: 1,
        game: "Poker"
      }
    };

    const res = mockResponse();

    await updateStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error"
    });
    User.findOne.mockRestore();
  });
});


describe("handleTransaction API Tests", () => {
  test("creates transaction history for Poker", async () => {
    const req = {
      body: {
        username: "testUser",
        transaction: 100,
        game: "Poker",
        day: "2023-01-01"
      }
    };

    const res = mockResponse();

    await handleTransaction(req, res);

    const history = await History.findOne();
    expect(history).toBeTruthy();
    expect(history.transaction).toBe(100);
    expect(history.game).toBe("Poker");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  test("returns 400 for invalid request", async () => {
    const req = {
      body: {
        username: "testUser",
        game: "Poker"
      }
    };

    const res = mockResponse();

    await handleTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid request. Provide a username.",
      "success": false,
    });
  });

  test("returns 400 for non-Poker game", async () => {
    const req = {
      body: {
        username: "testUser",
        transaction: 100,
        game: "Blackjack",
        day: "2023-01-01"
      }
    };

    const res = mockResponse();

    await handleTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid request. Provide a username.",
      "success": false,
    });
  });

  test("handles database errors", async () => {
    jest.spyOn(History, "create").mockRejectedValue(new Error("DB error"));
    const req = {
      body: {
        username: "testUser",
        transaction: 100,
        game: "Poker",
        day: "2023-01-01"
      }
    };

    const res = mockResponse();

    await handleTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      success: false,
      message: "Server error" 
    });
    
    History.create.mockRestore();
  });
});