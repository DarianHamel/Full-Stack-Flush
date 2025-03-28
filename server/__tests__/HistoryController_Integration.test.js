const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const cookieParser = require("cookie-parser");
const historyRoutes = require("../routes/HistoryRoute");
const User = require("../Models/UserModel");
const History = require("../Models/HistoryModel");

jest.setTimeout(60000);

describe("History Route Integration Tests", () => {
  let mongoServer;
  let testServer;
  let app;

  beforeAll(async () => {
    // in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // test express app
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/", historyRoutes);

    testServer = app.listen(0);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    testServer.close();
  });

  beforeEach(async () => {
    await User.create({
      username: "testUser",
      password: "testPass",
      email: "test@test.com"
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await History.deleteMany({});
  });

  describe("GET /getHistory", () => {
    it("should return 404 if username is missing", async () => {
      const response = await request(testServer)
        .get("/getHistory");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Username is required");
    });

    it("should return 400 if no history exists", async () => {
      const response = await request(testServer)
        .get("/getHistory")
        .query({ username: "testUser" });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No transactions were made yet");
    });

    it("should return history if it exists", async () => {
      await History.create({
        username: "testUser",
        transaction: 100,
        game: "Blackjack",
        day: new Date()
      });

      const response = await request(testServer)
        .get("/getHistory")
        .query({ username: "testUser" });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].transaction).toBe(100);
    });
  });

  describe("POST /makeHistory", () => {
    it("should return 404 if required fields are missing", async () => {
      const response = await request(testServer)
        .post("/makeHistory")
        .send({});
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Needed parameters needed");
    });

    it("should return 400 if user doesn't exist", async () => {
      await User.deleteMany({});
      const response = await request(testServer)
        .post("/makeHistory")
        .send({
          username: "nonExistentUser",
          transaction: 100,
          game: "Blackjack"
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot locate user");
    });

    it("should return 400 for invalid game type", async () => {
      const response = await request(testServer)
        .post("/makeHistory")
        .send({
          username: "testUser",
          transaction: 100,
          game: "InvalidGame"
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Game is not found");
    });

    it("should create history for valid deposit", async () => {
      const response = await request(testServer)
        .post("/makeHistory")
        .send({
          username: "testUser",
          transaction: 100,
          game: "Deposit",
          day: new Date().toISOString()
        });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Added user transaction");

      const history = await History.findOne({ username: "testUser" });
      expect(history).not.toBeNull();
    });

    it("should create history for valid game", async () => {
      const response = await request(testServer)
        .post("/makeHistory")
        .send({
          username: "testUser",
          transaction: 100,
          game: "Blackjack",
          day: new Date().toISOString()
        });
      expect(response.status).toBe(201);

      const history = await History.findOne({ game: "Blackjack" });
      expect(history.transaction).toBe(100);
    });
  });
});