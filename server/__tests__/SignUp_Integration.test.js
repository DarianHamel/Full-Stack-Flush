const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const app = require("../server"); 

jest.setTimeout(60000); 

describe("Signup Integration Tests", () => {
  let mongoServer;
  const testPassword = "testpassword";

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

  
  test("POST /signup should create a new user", async () => {
    const response = await request(app)
      .post("/signup")
      .send({ username: "testuser", password: testPassword });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "User signed in successfully");
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("username", "testuser");
    expect(response.body.user.balance).toBe(100); // Default balance
  });

  test("POST /signup should return 400 if username already exists", async () => {
    // Create a user with the same username
    await User.create({ username: "testuser", password: testPassword });

    const response = await request(app)
      .post("/signup")
      .send({ username: "testuser", password: testPassword });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "User already exists");
  });

  test("POST /signup should return 404 if username or password is missing", async () => {
    const response = await request(app)
      .post("/signup")
      .send({ username: "testuser" }); // Missing password

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Needed parameters needed");
  });

  test("POST /signup should store password as a hash", async () => {
    const response = await request(app)
      .post("/signup")
      .send({ username: "testuser", password: testPassword });

    expect(response.status).toBe(201);

    // Verify that the password is stored as a hash
    const user = await User.findOne({ username: "testuser" });
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    expect(isPasswordValid).toBe(true);
  });

  test("POST /signup should return 500 if User.findOne fails", async () => {
    // Mock User.findOne to simulate a database error
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/signup")
      .send({ username: "testuser", password: testPassword });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Server error");

    // Restore the original User.findOne implementation
    User.findOne.mockRestore();
  });
});