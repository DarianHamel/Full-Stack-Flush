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
  await User.deleteMany(); 
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Balance API Tests", () => {

  // 1 -- test GetBalance with an existing user

  test("GetBalance should return correct balance", async () => {
    await User.create({ username: "testuser", password: "hello", balance: 300 });

    const req = { query: { username: "testuser" } };
    const res = mockResponse();

    await GetBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonParseResponse).toEqual({ balance: 300 });
  });

  // 2 -- test Get Balance with a bad user 

  test("GetBalance should return a 404 if user not found", async () => {
    const req = { query: { username: "badactor"} };
    const res = mockResponse();

    await GetBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(404);
    expect(jsonParseResponse).toEqual({ message: "User not found" });
  });

});

describe("Update Balance API Tests", () => {

  // 3 -- test UpdateBalance with a successful deposit (correct password)

  test("UpdateBalance should return the balance if the deposit is successful", async () => {
    await User.create({ username: "mockUser", password: "gr12-fff", balance: 300 });

    const req = { body: { username: "mockUser", amount: 50, password: "gr12-fff" } };
    const res = mockResponse();

    await UpdateBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonParseResponse).toEqual({ balance: 350, success: true });
  });

  // 4 -- test UpdateBalance with a successful withdrawl (correct password)

  test("UpdateBalance should return the balance is the withdrawal is successful", async () => {
    await User.create({ username: "mockUser", password: "gr12-fff", balance: 300 });

    const req = { body: { username: "mockUser", amount: -50, password: "gr12-fff" } };
    const res = mockResponse();

    await UpdateBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonParseResponse).toEqual({ balance: 250, success: true });
  });

  // 5 -- test UpdateBalance with a bad deposit (incorrect password)

  test("UpdateBalance should return a 400 if the password is incorrect", async () => {
    await User.create({ username: "mockUser", password: "gr12-fff", balance: 300 });

    const req = { body: { username: "mockUser", amount: 25, password: "bad-password" } };
    const res = mockResponse();

    await UpdateBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonParseResponse).toEqual({ message: "Incorrect password", success: false });
  });

  // 6 -- test UpdateBalance with betting more than I have (insufficient balance)

  test("UpdateBalance should return a 400 if balance is not enough for a withdrawal", async () => {
    await User.create({ username: "mockUser", password: "gr12-fff", balance: 300 });

    const req = { body: { username: "mockUser", amount: -400, password: "gr12-fff" } }; // betting $400 when my balance is $300
    const res = mockResponse();

    await UpdateBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonParseResponse).toEqual({ message: "Insufficient balance", success: false });
  });

  // 7 -- test UpdateBalance with a bad user (user doesn't exist)
  
  test("UpdateBalance should return 404 if the user doesn't exist", async () => {
    const req = { body: { username: "badUser", amount: 400, password: "badUser-password" } }; // betting $400 when my balance is $300
    const res = mockResponse();

    await UpdateBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(404);
    expect(jsonParseResponse).toEqual({ message: "User not found", success: false });
  });


  // 8 -- test UpdateBalance with a server error on User.findOne()

  test("UpdateBalance returns server error if User.findOne() fails", async () => {
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

    const req = { body: { username: "baduser", amount: 100, password: "gr12-fff" }};
    const res = mockResponse();

    await UpdateBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(500);
    expect(jsonParseResponse).toEqual({ message: "Server error", success: false });

    User.findOne.mockRestore();
  });

  // 9 -- test UpdateBalance with a server error on User.save()

  test("UpdateBalance returns server error if User.save() fails", async () => {
    const mockUser = new User({ username: "mockUser", balance: 200, password: await bcrypt.hash("gr12-fff", 12) });
    jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
    jest.spyOn(mockUser, "save").mockRejectedValue(new Error("Database save error"));

    const req = { body: { username: "mockUser", amount: 50, password: "gr12-fff" } };
    const res = mockResponse();

    await UpdateBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(500);
    expect(jsonParseResponse).toEqual({ message: "Server error", success: false });

    User.findOne.mockRestore();
    mockUser.save.mockRestore();
  });

  // 10 -- test UpdateBalance with an invalid request (bad username or bad amount)

  test("UpdateBalance returns 400 if there is an invalid request", async () => {
    await User.create({ username: "mockUser", password: "gr12-fff", balance: 300 });

    const req = { body: { amount: 50, password: "gr12-fff" } };
    const res = mockResponse();

    await UpdateBalance(req, res);
    const jsonParseResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonParseResponse).toEqual({ message: "Invalid request. Provide username and amount as a number.", success: false });
  });

});

