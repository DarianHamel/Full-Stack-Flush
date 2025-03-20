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
  await User.deleteMany(); 
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ========================================================================

describe("GetLeaderboard API Tests", () => {

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
                expect.objectContaining({username: "user3"}) ]));
    });

    test("GetLeaderboard should return 400 if there's an invlid sortBy parameter", async () => {
        const req = {query: {sortBy: "gender", order: "desc"} };  // gender is not part of any of our leaderboard filters
        const res = mockResponse();

        await GetLeaderboard(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonParseResponse).toEqual({error: "Invalid sorting option"});

    });

    test("GetLeaderboard returns server error if User.find() fails", async () => {
        jest.spyOn(User, "find").mockRejectedValue(new Error("Database error"));
    
        const req = {query: {sortBy: "moneySpent", order: "desc"} };
        const res = mockResponse();
    
        await GetLeaderboard(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonParseResponse).toEqual({ error: "Error occured when fetching the leaderboard" });
    
        User.find.mockRestore();
      });

      test("GetLeaderboard should use default sorting when no query parameters are given", async () => {
        await User.create([
            {username: "user1", password: "hello", balance: 100, wins: 8, losses: 5, moneySpent: 200, timeSpent: 155},
            {username: "user2", password: "bye", balance: 100, wins: 10, losses: 2, moneySpent: 1000, timeSpent: 60},
            {username: "user3", password: "password", balance: 100, wins: 5, losses: 5, moneySpent: 500, timeSpent: 95}
        ]);

        const req = { query: {} };
        const res = mockResponse();

        await GetLeaderboard(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({username: "user3"}),
                expect.objectContaining({username: "user2"}),
                expect.objectContaining({username: "user1"}) ]));
      });

});

describe("ApplyFilters API Tests", () => {
    test("ApplyFilters should return correct filter criteria", async () => {
        expect(applyFilters("highSpenders")).toEqual({moneySpent: {$gte: 1500}});
        expect(applyFilters("longestPlayers")).toEqual({timeSpent: {$gte: 100*3600}});
        expect(applyFilters("")).toEqual({});
    });
});

describe("CalculateWinLossRatio API Tests", () => {
    test("CalculateWinLossRatio should compute correct ratios", async () => {
        const users = [
            {username: "user1", password: "hello", balance: 100, wins: 8, losses: 5, moneySpent: 200, timeSpent: 155},
            {username: "user2", password: "bye", balance: 100, wins: 10, losses: 2, moneySpent: 1000, timeSpent: 60},
        ];
  
        const result = calculateWinLossRatio(users);
        
        expect(result).toEqual([
            expect.objectContaining({winLossRatio: "1.60"}),
            expect.objectContaining({winLossRatio: "5.00"}), ]); 
    });

    test("CalculateWinLossRatio should compute ratios correctly even with a 0 in the denominator", async () => {
        const users = [
            {username: "user1", password: "hello", balance: 100, wins: 10, losses: 2, moneySpent: 200, timeSpent: 155},
            {username: "user2", password: "bye", balance: 100, wins: 5, losses: 0, moneySpent: 1000, timeSpent: 60},
            {username: "user3", password: "bye", balance: 100, wins: 7, losses: 3, moneySpent: 1000, timeSpent: 60},
        ];

        const result = calculateWinLossRatio(users);

        expect(result).toEqual([
            {username: "user1", password: "hello", balance: 100, wins: 10, losses: 2, moneySpent: 200, timeSpent: 155, winLossRatio: "5.00"},
            {username: "user2", password: "bye", balance: 100, wins: 5, losses: 0, moneySpent: 1000, timeSpent: 60, winLossRatio: 5},
            {username: "user3", password: "bye", balance: 100, wins: 7, losses: 3, moneySpent: 1000, timeSpent: 60, winLossRatio: "2.33"},
        ]);
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

    test("Should sort users by wins in descending order", async () => {
        const result = sortLeaderboard([...users], "wins", "desc");
        expect(result.map(user => user.username)).toEqual(["user2", "user1", "user3"]);
    });

    test("Should sort users by wins in ascending order", async () => {
        const result = sortLeaderboard([...users], "wins", "asc");
        expect(result.map(user => user.username)).toEqual(["user3", "user1", "user2"]);
    });

    test("Should sort users by moneySpent in descending order", async () => {
        const result = sortLeaderboard([...users], "moneySpent", "desc");
        expect(result.map(user => user.username)).toEqual(["user2", "user3", "user1"]);
    });

    test("Should sort users by moneySpent in ascending order", async () => {
        const result = sortLeaderboard([...users], "moneySpent", "asc");
        expect(result.map(user => user.username)).toEqual(["user1", "user3", "user2"]);
    });

    test("Should sort users by timeSpent in descending order", async () => {
        const result = sortLeaderboard([...users], "timeSpent", "desc");
        expect(result.map(user => user.username)).toEqual(["user1", "user3", "user2"]);
    });

    test("Should sort users by timeSpent in ascending order", async () => {
        const result = sortLeaderboard([...users], "timeSpent", "asc");
        expect(result.map(user => user.username)).toEqual(["user2", "user3", "user1"]);
    });

    test("Should sort users by username in descending order", async () => {
        const result = sortLeaderboard([...users], "username", "desc");
        expect(result.map(user => user.username)).toEqual(["user3", "user2", "user1"]);
    });

    test("Should sort users by username in ascending order", async () => {
        const  result = sortLeaderboard([...users], "username", "asc");
        expect(result.map(user => user.username)).toEqual(["user1", "user2", "user3"]);
    });
})