const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const User = require("../Models/UserModel");

let mongoServer;

// Setup an in-memory MongoDB instance for testing
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup and disconnect after tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Reset database between tests
beforeEach(async () => {
  await User.deleteMany({});
});

describe("Profile API Integration Tests", () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      username: "testuser",
      password: "hashedpassword", 
      balance: 500,
      timeLimit: 120,
      moneyLimit: 1000,
      timeSpent: 0,
      moneySpent: 0,
      wins: 10,
      losses: 5,
      lastLogin: new Date(),
      numLogins: 1,
    });
    await testUser.save();
  });
/*
  test("GET /userInfo should return user details (without password)", async () => {
    const res = await request(app).get("/userInfo").query({ username: "testuser" });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("testuser");
    expect(res.body.password).toBeUndefined();
  });
*/
  test("GET /getBalance should return user balance", async () => {
    const res = await request(app).get("/getBalance").query({ username: "testuser" });
    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(500);
  });

  test("POST /setTimeSpent should update user's time spent", async () => {
    const res = await request(app).post("/setTimeSpent").send({ username: "testuser", timeSpent: 60 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findOne({ username: "testuser" });
    expect(updatedUser.timeSpent).toBe(60);
  });

  test("POST /resetDailyLimits should reset limits", async () => {
    const res = await request(app).post("/resetDailyLimits").send({ username: "testuser" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findOne({ username: "testuser" });
    expect(updatedUser.dailyTimeSpent).toBe(0);
    expect(updatedUser.dailyMoneySpent).toBe(0);
  });

  test("POST /setMoneyLimit should update money limit", async () => {
    const res = await request(app).post("/setMoneyLimit").send({ username: "testuser", moneyLimit: 2000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findOne({ username: "testuser" });
    expect(updatedUser.moneyLimit).toBe(2000);
  });

  test("POST /setMoneyLimit should reject invalid money limit", async () => {
    const res = await request(app).post("/setMoneyLimit").send({ username: "testuser", moneyLimit: -10 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /getLimits should return user limits", async () => {
    const res = await request(app).get("/getLimits").query({ username: "testuser" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.moneyLimit).toBe(1000);
    expect(res.body.timeLimit).toBe(120);
  });

  test("GET /getStats should return user statistics", async () => {
    const res = await request(app).get("/getStats").query({ username: "testuser" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.wins).toBe(10);
    expect(res.body.losses).toBe(5);
  });

  test("GET /getLastLogin should return last login date", async () => {
    const res = await request(app).get("/getLastLogin").query({ username: "testuser" });
    expect(res.status).toBe(200);
    expect(new Date(res.body.lastLogin)).toEqual(testUser.lastLogin);
  });

  test("GET /userInfo should return 404 for non-existing user", async () => {
    const res = await request(app).get("/userInfo").query({ username: "unknown" });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  test("POST /setTimeSpent should reject negative time values", async () => {
    const res = await request(app).post("/setTimeSpent").send({ username: "testuser", timeSpent: -10 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
