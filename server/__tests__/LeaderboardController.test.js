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
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({username: "user2"}),
                expect.objectContaining({username: "user1"}),
                expect.objectContaining({username: "user3"})
            ])
        );
    });

    test("applyFilters should return correct filter criteria", () => {
        expect(applyFilters("highSpenders")).toEqual({moneySpent: {$gte: 1500}});
        expect(applyFilters("longestPlayers")).toEqual({timeSpent: {$gte: 100}});
        expect(applyFilters("")).toEqual({});
    });

    test("calculateWinLossRatio should compute correct ratios", () => {
        const users = [
            {username: "user1", password: "hello", balance: 100, wins: 8, losses: 5, moneySpent: 200, timeSpent: 155},
            {username: "user2", password: "bye", balance: 100, wins: 10, losses: 2, moneySpent: 1000, timeSpent: 60},
        ];
  
        const result = calculateWinLossRatio(users);
        
        expect(result).toEqual([
            expect.objectContaining({winLossRatio: "1.60"}),
            expect.objectContaining({winLossRatio: "5.00"}),
        ]) // Now it checks the actual returned value
    });
});

describe("Leaderboard Sorting Tests", () => {
    let users;

    beforeEach(async () => {
        users = [
            {username: "user1", password: "hello", balance: 100, wins: 8, losses: 5, moneySpent: 200, timeSpent: 155},
            {username: "user2", password: "bye", balance: 100, wins: 10, losses: 2, moneySpent: 1000, timeSpent: 60},
            {username: "user3", password: "password", balance: 100, wins: 5, losses: 5, moneySpent: 500, timeSpent: 95}
        ];
    });

    test("should sort users by wins in descending order", () => {
        const result = sortLeaderboard([...users], "wins", "desc");
        expect(result.map(user => user.username)).toEqual(["user2", "user1", "user3"]);
    });

    test("should sort users by wins in ascending order", () => {
        const result = sortLeaderboard([...users], "wins", "asc");
        expect(result.map(user => user.username)).toEqual(["user3", "user1", "user2"]);
    });

    test("should sort users by moneySpent in descending order", () => {
        const result = sortLeaderboard([...users], "moneySpent", "desc");
        expect(result.map(user => user.username)).toEqual(["user2", "user3", "user1"]);
    });

    test("should sort users by moneySpent in ascending order", () => {
        const result = sortLeaderboard([...users], "moneySpent", "asc");
        expect(result.map(user => user.username)).toEqual(["user1", "user3", "user2"]);
    });

    test("should sort users by timeSpent in descending order", () => {
        const result = sortLeaderboard([...users], "timeSpent", "desc");
        expect(result.map(user => user.username)).toEqual(["user1", "user3", "user2"]);
    });

    test("should sort users by timeSpent in ascending order", () => {
        const result = sortLeaderboard([...users], "timeSpent", "asc");
        expect(result.map(user => user.username)).toEqual(["user2", "user3", "user1"]);
    });

    test("should sort users by username in descending order", () => {
        const result = sortLeaderboard([...users], "username", "desc");
        expect(result.map(user => user.username)).toEqual(["user3", "user2", "user1"]);
    });

    test("should sort users by username in ascending order", () => {
        const  result = sortLeaderboard([...users], "username", "asc");
        expect(result.map(user => user.username)).toEqual(["user1", "user2", "user3"]);
    });
})