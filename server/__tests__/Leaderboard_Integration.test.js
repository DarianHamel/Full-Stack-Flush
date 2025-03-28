const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const app = require("../server"); 
const { getLeaderboard, applyFilters, calculateWinLossRatio, sortLeaderboard } = require("../Controllers/LeaderboardController");

let mongoServer;

beforeAll(async () => {
  // Start an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Clean up the database and close connections
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  await User.deleteMany({});
});

describe("GetLeaderboard Integration Tests", () => {
  test("GET /leaderboard should return sorted users by wins in descending order", async () => {
    // Seed the database with test users
    await User.create([
      { username: "user1", password: "hello", balance: 100, wins: 8, losses: 5, moneySpent: 200, timeSpent: 155 },
      { username: "user2", password: "bye", balance: 100, wins: 10, losses: 2, moneySpent: 1000, timeSpent: 60 },
      { username: "user3", password: "password", balance: 100, wins: 5, losses: 5, moneySpent: 500, timeSpent: 95 }
    ]);

    // Make a request to the /leaderboard endpoint
    const response = await request(app)
      .get("/leaderboard")
      .query({ sortBy: "wins", order: "desc" });

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "user2", wins: 10 }),
        expect.objectContaining({ username: "user1", wins: 8 }),
        expect.objectContaining({ username: "user3", wins: 5 })
      ])
    );
  });

  test("GET /leaderboard should return users filtered by highSpenders", async () => {
    // Seed the database with test users
    await User.create([
      { username: "user1", password: "hello", balance: 100, wins: 8, losses: 5, moneySpent: 200, timeSpent: 155 },
      { username: "user2", password: "bye", balance: 100, wins: 10, losses: 2, moneySpent: 2000, timeSpent: 60 },
      { username: "user3", password: "password", balance: 100, wins: 5, losses: 5, moneySpent: 500, timeSpent: 95 }
    ]);

    // Make a request to the /leaderboard endpoint with the highSpenders filter
    const response = await request(app)
      .get("/leaderboard")
      .query({ filter: "highSpenders" });

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "user2", moneySpent: 2000 })
      ])
    );
    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "user1" }),
        expect.objectContaining({ username: "user3" })
      ])
    );
  });

  test("GET /leaderboard should return 400 for invalid sortBy parameter", async () => {
    // Make a request to the /leaderboard endpoint with an invalid sortBy parameter
    const response = await request(app)
      .get("/leaderboard")
      .query({ sortBy: "invalidField", order: "desc" });

    // Verify the response
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid sorting option" });
  });

  test("GET /leaderboard should return 500 if database query fails", async () => {
    // Mock User.find to simulate a database error
    jest.spyOn(User, "find").mockRejectedValue(new Error("Database error"));

    // Make a request to the /leaderboard endpoint
    const response = await request(app)
      .get("/leaderboard")
      .query({ sortBy: "wins", order: "desc" });

    // Verify the response
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Error occured when fetching the leaderboard" });

    // Restore the original User.find implementation
    User.find.mockRestore();
  });

  test("GET /leaderboard should calculate winLossRatio correctly", async () => {
    // Seed the database with test users
    await User.create([
      { username: "user1", password: "hello", balance: 100, wins: 8, losses: 4, moneySpent: 200, timeSpent: 155 },
      { username: "user2", password: "bye", balance: 100, wins: 10, losses: 0, moneySpent: 1000, timeSpent: 60 }
    ]);

    // Make a request to the /leaderboard endpoint
    const response = await request(app)
      .get("/leaderboard")
      .query({ sortBy: "winLossRatio", order: "desc" });

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "user2", winLossRatio: 10 }),
        expect.objectContaining({ username: "user1", winLossRatio: "2.00" })
      ])
    );
  });
});