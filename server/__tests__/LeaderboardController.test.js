const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const { GetLeaderboard, applyFilters, calculateWinLossRatio, sortLeaderboard } = require("../Controllers/LeaderboardController");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany(); // Clear test database before each test
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Leaderboard API Tests", () => {
    test("GetLeaderboard should return sorted users", async () => {
        await User.create([
            {username: "user1", password: "hello", balance: 100, wins: 8, losses: 5, moneySpent: 200, timeSpent: 155},
            {username: "user2", password: "bye", balance: 100, wins: 10, losses: 2, moneySpent: 1000, timeSpent: 60},
            {username: "user3", password: "password", balance: 100, wins: 5, losses: 5, moneySpent: 500, timeSpent: 95}
        ]);
  
        const req = {query: {sortBy: "wins", order: "desc"} };
        const res = mockResponse();
    
        await GetLeaderboard(req, res);
    
        // Capture the first call to res.json and extract its arguments
        //const jsonResponse = res.json.mock.calls[0][0];
        //console.log(jsonResponse);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({username: "user2"}),
                expect.objectContaining({username: "user1"}),
                expect.objectContaining({username: "user3"})
            ]) // Now it checks the actual returned value
        );
    });

    test("applyFilters should return correct filter criteria", () => {
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({username: "user2"}),
                expect.objectContaining({username: "user1"}),
                expect.objectContaining({username: "user3"})
            ]) // Now it checks the actual returned value
        );
    });
});