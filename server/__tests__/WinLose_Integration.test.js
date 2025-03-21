const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const app = require("../server");

jest.setTimeout(120000);

describe("WinLose Controller Integration Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    // Start an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GET /getWins should return the correct win count for a valid user", async () => {
    // Create a test user
    await User.create({ username: "testuser", password: "testpassword", wins: 10, losses: 5 });

    const response = await request(app)
      .get("/getWins")
      .query({ username: "testuser" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("wins", 10);
  });

  test("GET /getWins should return 404 if the user is not found", async () => {
    const response = await request(app)
      .get("/getWins")
      .query({ username: "unknownuser" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");
  });

  test("GET /getWins should return 500 if User.findOne fails", async () => {
    // Mock User.findOne to simulate a database error
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .get("/getWins")
      .query({ username: "testuser" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Server error");

    // Restore the original User.findOne implementation
    User.findOne.mockRestore();
  });

  
  test("GET /getLosses should return the correct loss count for a valid user", async () => {
    // Create a test user
    await User.create({ username: "testuser", password: "testpassword", wins: 10, losses: 5 });

    const response = await request(app)
      .get("/getLosses")
      .query({ username: "testuser" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("losses", 5);
  });

  test("GET /getLosses should return 404 if the user is not found", async () => {
    const response = await request(app)
      .get("/getLosses")
      .query({ username: "unknownuser" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");
  });

  test("GET /getLosses should return 500 if User.findOne fails", async () => {
    // Mock User.findOne to simulate a database error
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .get("/getLosses")
      .query({ username: "testuser" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Server error");

    // Restore the original User.findOne implementation
    User.findOne.mockRestore();
  });


  test("POST /updateStats should update wins and losses for a valid user", async () => {
    // Create a test user
    await User.create({ username: "testuser", password: "testpassword", wins: 10, losses: 5 });

    const response = await request(app)
      .post("/updateStats")
      .send({ username: "testuser", wins: 2, losses: 3, money: 0, game: "Poker" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("wins", 12);
    expect(response.body).toHaveProperty("losses", 8);
  });

  test("POST /updateStats should return 404 if the user is not found", async () => {
    const response = await request(app)
      .post("/updateStats")
      .send({ username: "unknownuser", wins: 2, money: 0, losses: 3, game: "Poker" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "User not found");
  });

  test("POST /updateStats should return 400 if wins or losses are negative", async () => {
    // Create a test user
    await User.create({ username: "testuser", password: "testpassword", wins: 10, losses: 5 });

    const response = await request(app)
      .post("/updateStats")
      .send({ username: "testuser", wins: -2, losses: 3, money: 0, game: "Blackjack" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Invalid values");
  });

  test("POST /updateStats should return 400 if username is missing", async () => {
    const response = await request(app)
      .post("/updateStats")
      .send({ wins: 2, losses: 3, money: 0, game: "Blackjack" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid request. Provide a username.");
  });

  test("POST /updateStats should return 500 if User.findOne fails", async () => {
    // Mock User.findOne to simulate a database error
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/updateStats")
      .send({ username: "testuser", wins: 2, losses: 3, money: 0, game: "Blackjack" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Server error");

    // Restore the original User.findOne implementation
    User.findOne.mockRestore();
  });

  test("POST /updateStats should return 500 if User.save fails", async () => {
    // Create a test user
    await User.create({ username: "testuser", password: "testpassword", wins: 10, losses: 5 });

    // Mock User.save to simulate a database error
    jest.spyOn(User.prototype, "save").mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/updateStats")
      .send({ username: "testuser", wins: 2, losses: 3, money: 0, game: "Poker" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Server error");

    // Restore the original User.save implementation
    //User.save.mockRestore();
  });
});