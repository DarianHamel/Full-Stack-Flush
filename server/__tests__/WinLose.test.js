const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const { GetWins, GetLosses, UpdateStats } = require("../Controllers/WinLoseController");

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
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ========================================================================

describe("GetWins API Tests", () => {

    // 1 -- Return correct win count 

    test("GetWins returns the correct win count for valid user", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });
        
        const req = { query: { username: "mockUser" } };
        const res = mockResponse();

        await GetWins(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonParseResponse).toEqual({ wins: 10 });
    });

    // 2 -- Return 404 if user is not found

    test("GetWins returns 404 if the user if not found", async () => {
        const req = { query: { username: "badUser" } };
        const res = mockResponse();

        await GetWins(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(404);
        expect(jsonParseResponse).toEqual({ message: "User not found" });
    });

    // 3 -- Handles server error when User.findOne throws an error

    test("GetWins returns server error if User.findOne() fails", async () => {
        jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

        const req = { query: { username: "badUser" }};
        const res = mockResponse();

        await GetWins(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonParseResponse).toEqual({ message: "Server error" });

        User.findOne.mockRestore();
    });

});

describe("GetLosses API Tests", () => {

    // 4 -- Return correct lose count 

    test("GetLosses returns the correct losses for valid user", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });

        const req = { query: { username: "mockUser" } };
        const res = mockResponse();

        await GetLosses(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonParseResponse).toEqual({ losses: 5 });
    });

    // 5 -- Return 404 is user is not found

    test("GetLosses returns 404 if the user if not found", async () => {
        const req = { query: { username: "badUser" } };
        const res = mockResponse();

        await GetLosses(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(404);
        expect(jsonParseResponse).toEqual({ message: "User not found" });
    });

    // 6 -- Handles server error when User.findOne throws an error

    test("GetLosses returns server error if User.findOne() fails", async () => {
        jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

        const req = { query: { username: "badUser" }};
        const res = mockResponse();

        await GetLosses(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonParseResponse).toEqual({ message: "Server error" });

        User.findOne.mockRestore();
    });

});

describe("UpdateStats API Tests", () => {

    // 7 -- Updates wins and losses successfully 

    test("UpdateStats will update wins and losses successfully", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });

        const req = { body: { username: "mockUser", wins: 2, losses: 3, game: "Poker" } };
        const res = mockResponse();

        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonParseResponse).toEqual({ success: true, wins: 12, losses: 8 });
    });

    // 8 -- Returns 400 if username is not found 

    test("UpdateStats will return 404 if user is not found", async () => {
        const req = { body: { username: "badUser", wins: 2, losses: 3, game: "Blackjack" } };
        const res = mockResponse();

        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(404);
        expect(jsonParseResponse).toEqual({ success: false, message: "User not found" });
    });

    // 9 -- Returns 400 if wins is negative

    test("UpdateStats will return a 400 if wins is negative", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });

        const req = { body: { username: "mockUser", wins: -2, losses: 3, game: "Poker" } };
        const res = mockResponse();

        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonParseResponse).toEqual({ success: false, message: "Invalid values" });
    });

    // 10 -- Returns 400 if losses is negative

    test("UpdateStats will return a 400 if losses is negative", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });

        const req = { body: { username: "mockUser", wins: 2, losses: -3, game: "Blackjack" } };
        const res = mockResponse();

        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonParseResponse).toEqual({ success: false, message: "Invalid values" });
    });

    // 11 -- Handles server error of User.findOne

    test("UpdateStats will return server error if User.findOne fails", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });
        jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

        const req = { body: { username: "mockUser", wins: 2, losses: 3, game: "Poker" } };
        const res = mockResponse();

        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonParseResponse).toEqual({ success: false, message: "Server error" });

        User.findOne.mockRestore();
    });

    // 12 -- Handles server error of User.save

    test("UpdateStats returns server error if User.save() fails", async () => {
        const mockUser = new User({ username: "mockUser", password: await bcrypt.hash("gr12-fff", 12), wins: 10, losses: 5 });
        jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "save").mockRejectedValue(new Error("Database save error"));
    
        const req = { body: { username: "mockUser", wins: 2, losses: 3, game: "Blackjack" } };
        const res = mockResponse();
    
        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonParseResponse).toEqual({ message: "Server error", success: false });
    
        User.findOne.mockRestore();
        mockUser.save.mockRestore();
      });

    // 13 -- Only increments wins if losses isn't provided

    test("UpdateStats will increment wins even if losses isn't provided", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });

        const req = { body: { username: "mockUser", wins: 5, game: "Poker" } };
        const res = mockResponse();

        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonParseResponse).toEqual({ success: true, wins: 15, losses: 5 });
    });

    // 14 -- Only increments losses if wins isn't provided

    test("UpdateStats will increment losses even if wins isn't provided", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });

        const req = { body: { username: "mockUser", losses: 2, game: "Blackjack" } };
        const res = mockResponse();

        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonParseResponse).toEqual({ success: true, wins: 10, losses: 7 });
    });

    // 15 -- Returns 400 if username is missing

    test("UpdateStats will not work if a username is missing", async () => {
        await User.create({ username: "mockUser", password: "gr12-fff", wins: 10, losses: 5 });

        const req = { body: { wins: 1, losses: 2, game: "Poker" } };
        const res = mockResponse();

        await UpdateStats(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonParseResponse).toEqual({ message: "Invalid request. Provide a username." });
    });

});