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

describe("Signup API Tests", () => {

    // 1 -- Successfully creates new user with default values (default since other values are for testing purposes)

    test("Signup creates a new user using default values", async () => {
        const req = { body: { username: "testUser", password: "gr12-fff" } };
        const res = mockResponse();
        const next = jest.fn();

        await Signup(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(201);

        expect(jsonParseResponse.message).toEqual("User signed in successfully");
        expect(jsonParseResponse.success).toEqual(true);

        // checking user information and if they actually are set to default values
        expect(jsonParseResponse.user.username).toEqual("testUser");
        expect(jsonParseResponse.user.balance).toEqual(100);
        expect(jsonParseResponse.user.wins).toEqual(0);
        expect(jsonParseResponse.user.losses).toEqual(0);
        expect(jsonParseResponse.user.timeSpent).toEqual(0);
        expect(jsonParseResponse.user.moneySpent).toEqual(0);
    });

    // 2 -- Do not create a new user if username already exists

    test("Signup does not create another use if username already exists", async () => {
        await User.create({ username: "testUser", password: "hello" });

        const req = { body: { username: "testUser", password: "gr12-fff" } };
        const res = mockResponse();
        const next = jest.fn();

        await Signup(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];

        const check = await User.findOne({ username: "testUser" });
        console.log("Hellothere2: ", check);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonParseResponse).toEqual({ message: "User already exists" });
    });

    // 3 -- Ensure password is stored in a hash, not plain text

    test("Signup sends back passowrd is stored as a hash", async () => {
        const samplePass = "gr12-fff";
        const req = { body: { username: "testUser", password: samplePass } };
        const res = mockResponse();
        const next = jest.fn();

        await Signup(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(201);
        expect(jsonParseResponse.user.username).toEqual("testUser");
        expect(await bcrypt.compare(samplePass, jsonParseResponse.user.password)).toBe(true);
    });

    // 4 -- Returns token when there's a successful signup

    test("Signup returns token when there's a successful signup", async () => {
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

        await Signup(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(201);
        expect(jsonParseResponse.user.username).toEqual("testUser");
        expect(jsonParseResponse).toHaveProperty('token', 'test_token');
    });

    // 5 -- Fail when required fails are missing 

    test("Signup should fail when either username or password is not present", async () => {
        const req = { body: { password: "gr12-fff", balance: 300 } };
        const res = mockResponse();
        const next = jest.fn();

        await Signup(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(404);
        expect(jsonParseResponse).toEqual({ message: "Needed parameters needed" });
    });

    // 6 -- Handles server errors 

    test("Signup returns server error if User.findOne fails", async () => {
        jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));
        
        const req = { body: { username: "baduser", password: "gr12-fff" }};
        const res = mockResponse();
        const next = jest.fn();
    
        await Signup(req, res, next);
        const jsonParseResponse = res.json.mock.calls[0][0];
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonParseResponse).toEqual({ message: "Server error" });
    
        User.findOne.mockRestore();
    });

});