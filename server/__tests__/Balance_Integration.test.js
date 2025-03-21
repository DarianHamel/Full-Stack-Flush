const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const app = require("../server");

jest.setTimeout(60000);

describe("Balance Controller Integration Tests", () => {
  let mongoServer;
  const testPassword = "testpassword";
  let testUser;

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

    // Create a test user
    //const hashedPassword = await bcrypt.hash(testPassword, 10);
    testUser = new User({ username: "testuser", balance: 100, password: testPassword });
    await testUser.save();
    console.log("Test user created.");
  });

  afterAll(async () => {
    // Clean up the database and close connections
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Reset the user's balance before each test
    await User.updateOne({ username: "testuser" }, { balance: 100 });
  });

  test("GET /balance should return user balance", async () => {
    const response = await request(app)
      .get("/balance")
      .query({ username: "testuser" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance", 100);
  });

  test("GET /balance should return 404 for non-existent user", async () => {
    const response = await request(app)
      .get("/balance")
      .query({ username: "unknown" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");
  });

  test("POST /update-balance should update user balance with correct password", async () => {
    const response = await request(app)
      .post("/update-balance")
      .send({ username: "testuser", amount: 50, password: testPassword });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("balance", 150);
  });

  test("POST /update-balance should return 400 for incorrect password", async () => {
    const response = await request(app)
      .post("/update-balance")
      .send({ username: "testuser", amount: 50, password: "wrongpassword" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Incorrect password");
  });

  test("POST /update-balance should return 400 for insufficient balance", async () => {
    const response = await request(app)
      .post("/update-balance")
      .send({ username: "testuser", amount: -200, password: testPassword });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Insufficient balance");
  });
});