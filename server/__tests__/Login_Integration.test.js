const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const app = require("../server"); 

jest.setTimeout(80000); 

describe("Login Integration Tests", () => {
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


  test("POST /login should log in a user with valid credentials", async () => {
    // Create a test user
    //const hashedPassword = await bcrypt.hash(testPassword, 10);
    await User.create({ username: "testuser", password: testPassword });

    const response = await request(app)
      .post("/login")
      .send({ username: "testuser", password: testPassword });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "User logged in successfully");
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("token");
  });

  test("POST /login should return 401 if password is incorrect", async () => {
    // Create a test user
    //const hashedPassword = await bcrypt.hash(testPassword, 10);
    await User.create({ username: "testuser", password: testPassword });

    const response = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Incorrect password or username");
  });

  test("POST /login should return 404 if username is incorrect", async () => {
    // Create a test user
    //const hashedPassword = await bcrypt.hash(testPassword, 10);
    await User.create({ username: "testuser", password: testPassword });

    const response = await request(app)
      .post("/login")
      .send({ username: "unknownuser", password: testPassword });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Incorrect password or username");
  });

  test("POST /login should return 400 if username or password is missing", async () => {
    const response = await request(app)
      .post("/login")
      .send({ username: "testuser" }); // Missing password

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "All fields are required");
  });

  test("POST /login should return 500 if User.findOne fails", async () => {
    // Mock User.findOne to simulate a database error
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/login")
      .send({ username: "testuser", password: testPassword });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Server error");

    // Restore the original User.findOne implementation
    User.findOne.mockRestore();
  });
});