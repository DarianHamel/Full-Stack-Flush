const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const { GetBalance, UpdateBalance } = require("../Controllers/BalanceController");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
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

describe("User Balance API Tests", () => {

  // 1. GetBalance - User exists
  test("GetBalance should return correct balance", async () => {
    await User.create({ username: "testuser", password: "hello", balance: 300 });

    const req = { query: { username: "testuser" } };
    const res = mockResponse();

    await GetBalance(req, res);
    console.log(res.json.mock);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ balance: 300 });
  });


});
