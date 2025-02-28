const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const { Signup, Login } = require("../Controllers/AuthController");

jest.mock('../util/SecretToken', () => ({
    createSecretToken: jest.fn(() => 'test_token')
}));

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
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

// ========================================================================

describe("Login API Tests", () => {

    // 7 -- Successfully logs in with valid credentials 
    
    test("Login logs in users with valid login credentials", async () => {
        await User.create({ username: "testUser", password: "gr12-fff" });
    
        const req = { body: { username: "testUser", password: "gr12-fff" } };
        const res = mockResponse();
        const next = jest.fn();
    
        await Login(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];
    
        expect(res.status).toHaveBeenCalledWith(201);
        expect(jsonParseResponse.message).toEqual("User logged in successfully");
        expect(jsonParseResponse.success).toEqual(true);
    });

    // 8 -- Fail login if password is wrong 

    test("Login fails if password is wrong even if username is right", async () => {
        await User.create({ username: "testUser", password: "gr12-fff" });
    
        const req = { body: { username: "testUser", password: "bad-password" } };
        const res = mockResponse();
        const next = jest.fn();
    
        await Login(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];
    
        expect(res.status).toHaveBeenCalledWith(401);
        expect(jsonParseResponse.message).toEqual("Incorrect password or username");
    });

    // 9 -- Fail login if username is wrong 

    test("Login fails is username is wrong even if password is right", async () => {
        await User.create({ username: "testUser", password: "gr12-fff" });
    
        const req = { body: { username: "bad-username", password: "gr12-fff" } };
        const res = mockResponse();
        const next = jest.fn();
    
        await Login(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];
    
        expect(res.status).toHaveBeenCalledWith(404);
        expect(jsonParseResponse.message).toEqual("Incorrect password or username");
    });

    // 10 -- Fail login if username/password is missing 

    test("Login fails if either the username or password is missing", async () => {
        await User.create({ username: "testUser", password: "gr12-fff" });
    
        const req = { body: { username: "testUser" } };
        const res = mockResponse();
        const next = jest.fn();
    
        await Login(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonParseResponse.message).toEqual("All fields are required");
    });

    // 11 -- Token is returned after a successful login 

    test("Login returns a token after a successful login", async () => {
        await User.create({ username: "testUser", password: "gr12-fff" });

        const req = { body: { username: "testUser", password: "gr12-fff" } };
        const res = mockResponse();
        const next = jest.fn();

        User.create = jest.fn(() => ({
            _id: "test_id", 
            username: "testUser",
            password: "gr12-fff",
            balance: 0,
            wins: 0,
            losses: 0,
            timeSpent: 0,
            moneySpent: 0
        }));

        await Login(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(201);
        expect(jsonParseResponse.message).toEqual("User logged in successfully");
        expect(jsonParseResponse.success).toEqual(true);
        expect(jsonParseResponse).toHaveProperty('token', 'test_token');
    }); 

    // 12 -- Handles server errors 

    test("Signup returns server error if User.findOne fails", async () => {
        jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

        const req = { body: { username: "testUser", password: "gr12-fff" }};
        const res = mockResponse();
        const next = jest.fn();

        await Login(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonParseResponse).toEqual({ message: "Server error" });

        User.findOne.mockRestore();
    }); 

});