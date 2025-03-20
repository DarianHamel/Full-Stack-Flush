const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const { GetUserInfo, GetMoneySpent, SetMoneySpent, GetTimeSpent, SetTimeSpent } = require("../Controllers/ProfileController");

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

// ========================================================================

describe("GetUserInfo API Tests", () => {
    
    // 1 -- Returns the correct user information of valid user

    test("GetUserInfo returns the correct user information of valid user", async () => {
        const samplePass = "gr12-fff";
        await User.create({ username: "mockUser", password: samplePass});

        const req = { query: { username: "mockUser" } };
        const res = mockResponse();

        await GetUserInfo(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonParseResponse.username).toEqual("mockUser");
        expect(await bcrypt.compare(samplePass, jsonParseResponse.password)).toBe(true);
    });

    // 2 -- Returns 404 if user does not exist

    test("GetUserInfo returns a 404 if the user doesn't exist", async () => {
        const req = { query: { username: "badUser" } };
        const res = mockResponse();

        await GetUserInfo(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(404);
        expect(jsonParseResponse).toEqual({ message: "User not found" });
    });

    // 3 -- Handles server error User.findOne gracefully 

    test("GetUserInfo returns server error by User.findOne fails", async () => {
        jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

        const req = { query: { username: "badUser" }};
        const res = mockResponse();

        await GetUserInfo(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonParseResponse).toEqual({ message: "Server error" });

        User.findOne.mockRestore();
    });

    // 4 -- Should not expose password

    test("GetUserInfo should not return the password in plain-text", async () => {
        const samplePass = "gr12-fff";
        await User.create({ username: "mockUser", password: samplePass});

        const req = { query: { username: "mockUser" } };
        const res = mockResponse();

        await GetUserInfo(req, res);
        const jsonParseResponse = res.json.mock.calls[0][0];

        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonParseResponse.password).not.toBe(samplePass);
    });

});

// describe("GetMoneySpent API Tests", () => {

//     // 5 -- Returns correct money spent of valid user

//     test("GetMoneySpent returns the money spent of valid user", async () => {
//         await User.create({ username: "mockUser", password: "gr12-fff", moneySpent: 100 });

//         const req = { query: { username: "mockUser" } };
//         const res = mockResponse();

//         await GetMoneySpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(200);
//         expect(jsonParseResponse).toEqual({ moneySpent: 100 });
//     });

//     // 6 -- Returns 404 if user does not exist 

//     test("GetMoneySpent returns a 404 if the user doesn't exist", async () => {
//         const req = { query: { username: "badUser" } };
//         const res = mockResponse();

//         await GetMoneySpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(404);
//         expect(jsonParseResponse).toEqual({ message: "User not found" });
//     });

//     // 7 -- Handles server error User.findOne gracefully 

//     test("GetMoneySpent returns server error by User.findOne fails", async () => {
//         jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

//         const req = { query: { username: "badUser" }};
//         const res = mockResponse();

//         await GetMoneySpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(500);
//         expect(jsonParseResponse).toEqual({ message: "Server error" });

//         User.findOne.mockRestore();
//     });

// });

// describe("SetMoneySpent API Tests", () => {

//     // 8 -- Sucessfully updates money spent of valid user

//     test("SetMoneySpent should increment money spent by the valid user", async () => {
//         await User.create({ username: "mockUser", password: "gr12-fff", moneySpent: 100 });

//         const req = { body: { username: "mockUser", money: 13 } };
//         const res = mockResponse();

//         await SetMoneySpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(200);
//         expect(jsonParseResponse).toEqual({ success: true, moneySpent: 113 });
//     });

//     // 9 -- Return 400 if money is missing or invalid (negative/0) + valid user

//     test("SetMoneySpent should return a 400 if the money is not valid", async () => {
//         await User.create({ username: "mockUser", password: "gr12-fff", moneySpent: 100 });

//         const req = { body: { username: "mockUser", money: -20 } };
//         const res = mockResponse();

//         await SetMoneySpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(400);
//         expect(jsonParseResponse).toEqual({ success: false, message: "Invalid money value" });
//     });

//     // 10 -- Return 404 if user does not exist

//     test("SetMoneySpent returns a 404 if the user doesn't exist", async () => {
//         const req = { body: { username: "badUser", money: 100 } };
//         const res = mockResponse();

//         await SetMoneySpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(404);
//         expect(jsonParseResponse).toEqual({ success: false, message: "User not found" });
//     });

//     // 11 -- Handles server error User.findOne gracefully 

//     test("SetMoneySpent returns server error by User.findOne fails", async () => {
//         jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

//         const req = { body: { username: "badUser", money: 100 }};
//         const res = mockResponse();

//         await SetMoneySpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(500);
//         expect(jsonParseResponse).toEqual({ success: false, message: "Server error" });

//         User.findOne.mockRestore();
//     });

// });

// describe("GetTimeSpent API Tests", () => {

//     // 12 -- Returns correct time spent of valid user

//     test("GetTimeSpent returns the correct time spent of a valid user", async () => {
//         await User.create({ username: "mockUser", password: "gr12-fff", timeSpent: 82 });

//         const req = { query: { username: "mockUser" } };
//         const res = mockResponse();

//         await GetTimeSpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(200);
//         expect(jsonParseResponse).toEqual({ timeSpent: 82 });
//     });

//     // 13 -- Return 404 if user does not exist

//     test("GetTimeSpent returns a 404 if the user doesn't exist", async () => {
//         const req = { query: { username: "badUser" } };
//         const res = mockResponse();

//         await GetTimeSpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(404);
//         expect(jsonParseResponse).toEqual({ message: "User not found" });
//     });

//     // 14 -- Handles server error User.findOne gracefully 

//     test("GetTimeSpent returns server error by User.findOne fails", async () => {
//         jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

//         const req = { query: { username: "badUser" }};
//         const res = mockResponse();

//         await GetTimeSpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(500);
//         expect(jsonParseResponse).toEqual({ message: "Server error" });

//         User.findOne.mockRestore();
//     });


// });

// describe("SetTimeSpent API Tests", () => {

//     // 15 -- Will successfully update time spent of valid user

//     test("SetTimeSpent should increment time spent by the valid user", async () => {
//         await User.create({ username: "mockUser", password: "gr12-fff", timeSpent: 82 });

//         const req = { body: { username: "mockUser", time: 12 } };
//         const res = mockResponse();

//         await SetTimeSpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(200);
//         expect(jsonParseResponse).toEqual({ success: true, timeSpent: 94 });
//     });

//     // 16 -- Return 400 if time value is missing or invalid

//     test("SetTimeSpent should return a 400 if the time is not valid", async () => {
//         await User.create({ username: "mockUser", password: "gr12-fff", timeSpent: 100 });

//         const req = { body: { username: "mockUser", time: -8 } };
//         const res = mockResponse();

//         await SetTimeSpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(400);
//         expect(jsonParseResponse).toEqual({ success: false, message: "Invalid time value" });
//     });

//     // 17 -- Return 404 if user is not found 

//     test("SetTimeSpent returns a 404 if the user doesn't exist", async () => {
//         const req = { body: { username: "badUser", money: 100 } };
//         const res = mockResponse();

//         await SetTimeSpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(404);
//         expect(jsonParseResponse).toEqual({ success: false, message: "User not found" });
//     });

//     // 18 -- Handles server error User.findOne gracefully 

//     test("SetTimeSpent returns server error by User.findOne fails", async () => {
//         jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

//         const req = { body: { username: "badUser", money: 100 }};
//         const res = mockResponse();

//         await SetTimeSpent(req, res);
//         const jsonParseResponse = res.json.mock.calls[0][0];

//         expect(res.status).toHaveBeenCalledWith(500);
//         expect(jsonParseResponse).toEqual({ success: false, message: "Server error" });

//         User.findOne.mockRestore();
//     });

// });