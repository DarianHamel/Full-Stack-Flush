const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const ProfileController = require("../Controllers/ProfileController");

jest.setTimeout(80000);

// Mock the User model
jest.mock("../Models/UserModel");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  jest.clearAllMocks();
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Profile Controller Tests", () => {
  describe("GetUserInfo", () => {
    test("returns correct user information", async () => {
      const mockUser = {
        username: "testUser",
        password: "hashedPass",
        timeLimit: 120,
        moneyLimit: 500
      };
      User.findOne.mockResolvedValue(mockUser);
      
      const req = { query: { username: "testUser" } };
      const res = mockResponse();

      await ProfileController.GetUserInfo(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        username: "testUser",
        password: "hashedPass",
        timeLimit: 120,
        moneyLimit: 500
      });
    });

    test("returns 404 if user doesn't exist", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { query: { username: "badUser" } };
      const res = mockResponse();

      await ProfileController.GetUserInfo(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("handles server errors", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { query: { username: "testUser" }};
      const res = mockResponse();

      await ProfileController.GetUserInfo(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("GetBalance", () => {
    test("returns correct balance", async () => {
      User.findOne.mockResolvedValue({ balance: 1000 });
      const req = { query: { username: "testUser" } };
      const res = mockResponse();

      await ProfileController.GetBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ balance: 1000 });
    });

    test("returns 404 when user not found", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { query: { username: "nonexistent" } };
      const res = mockResponse();
  
      await ProfileController.GetBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  
    test("handles database errors", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { query: { username: "testUser" } };
      const res = mockResponse();
  
      await ProfileController.GetBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("SetTimeSpent", () => {
    test("updates time spent successfully", async () => {
      const mockUser = {
        timeSpent: 30,
        updateTimeSpent: jest.fn().mockImplementation(function(time) {
          this.timeSpent += time;
          return Promise.resolve();
        }),
        save: jest.fn()
      };
      User.findOne.mockResolvedValue(mockUser);

      const req = { body: { username: "testUser", timeSpent: 60 } };
      const res = mockResponse();

      await ProfileController.SetTimeSpent(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        success: true, 
        timeSpent: 90 
      });
    });

    test("returns 404 when user not found", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { body: { username: "nonexistent", timeSpent: 60 } };
      const res = mockResponse();
  
      await ProfileController.SetTimeSpent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found"
      });
    });
  
    test("handles database errors", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { body: { username: "testUser", timeSpent: 60 } };
      const res = mockResponse();
  
      await ProfileController.SetTimeSpent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error"
      });
    });

    test("handles zero time spent", async () => {
      const req = { body: { username: "testUser", timeSpent: 0 } };
      const res = mockResponse();

      await ProfileController.SetTimeSpent(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Time spent updated"
      });
    });

    test("rejects invalid time values", async () => {
      const req = { body: { username: "testUser", timeSpent: -10 } };
      const res = mockResponse();

      await ProfileController.SetTimeSpent(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid time value"
      });
    });
  });

  describe("GetLastLogin", () => {
    test("returns last login date", async () => {
      const testDate = new Date();
      User.findOne.mockResolvedValue({ lastLogin: testDate });
      const req = { query: { username: "testUser" } };
      const res = mockResponse();

      await ProfileController.GetLastLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ lastLogin: testDate });
    });
  });

  test("returns 404 when user not found", async () => {
    User.findOne.mockResolvedValue(null);
    const req = { query: { username: "nonexistent" } };
    const res = mockResponse();

    await ProfileController.GetLastLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("handles database errors", async () => {
    User.findOne.mockRejectedValue(new Error("Database error"));
    const req = { query: { username: "testUser" } };
    const res = mockResponse();

    await ProfileController.GetLastLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  describe("ResetDailyLimits", () => {
    test("resets daily limits successfully", async () => {
      const mockUser = {
        numLogins: 0,
        dailyTimeSpent: 120,
        dailyMoneySpent: 100,
        lastLogin: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);

      const req = { body: { username: "testUser" } };
      const res = mockResponse();

      await ProfileController.ResetDailyLimits(req, res);
      expect(mockUser.numLogins).toBe(1);
      expect(mockUser.dailyTimeSpent).toBe(0);
      expect(mockUser.dailyMoneySpent).toBe(0);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Daily limits reset"
      });
    });

    test("returns 404 when user not found", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { body: { username: "nonexistent" } };
      const res = mockResponse();
  
      await ProfileController.ResetDailyLimits(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: "User not found" 
      });
    });
  
    test("handles database errors", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { body: { username: "testUser" } };
      const res = mockResponse();
  
      await ProfileController.ResetDailyLimits(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: "Server error" 
      });
    });
  });

  describe("GetMoneyLimit", () => {
    test("returns money limit", async () => {
      User.findOne.mockResolvedValue({ moneyLimit: 500 });
      const req = { query: { username: "testUser" } };
      const res = mockResponse();

      await ProfileController.GetMoneyLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, moneyLimit: 500 });
    });

    test("returns 404 when user not found", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { query: { username: "nonexistent" } };
      const res = mockResponse();
  
      await ProfileController.GetMoneyLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: "User not found" 
      });
    });
  
    test("handles database errors", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { query: { username: "testUser" } };
      const res = mockResponse();
  
      await ProfileController.GetMoneyLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: "Server error" 
      });
    });
  });

  describe("GetLimits", () => {
    test("returns all limit information", async () => {
      User.findOne.mockResolvedValue({
        moneyLimit: 500,
        timeLimit: 120,
        dailyTimeSpent: 60,
        dailyMoneySpent: 200,
        balance: 1000
      });
      const req = { query: { username: "testUser" } };
      const res = mockResponse();

      await ProfileController.GetLimits(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        moneyLimit: 500,
        timeLimit: 120,
        timeSpent: 60,
        moneySpent: 200,
        balance: 1000
      });
    });

    test("returns 404 when user not found in GetLimits", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { query: { username: "nonexistent" } };
      const res = mockResponse();
    
      await ProfileController.GetLimits(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found"
      });
    });

    test("handles database errors in GetLimits", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { query: { username: "testUser" } };
      const res = mockResponse();
    
      await ProfileController.GetLimits(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error"
      });
    });
  });

  describe("GetStats", () => {
    test("returns user statistics", async () => {
      User.findOne.mockResolvedValue({
        timeSpent: 360,
        moneySpent: 1000,
        wins: 5,
        losses: 3
      });
      const req = { query: { username: "testUser" } };
      const res = mockResponse();

      await ProfileController.GetStats(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        timeSpent: 360,
        moneySpent: 1000,
        wins: 5,
        losses: 3
      });
    });

    test("returns 404 when user not found", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { query: { username: "nonexistent" } };
      const res = mockResponse();
  
      await ProfileController.GetStats(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: "User not found" 
      });
    });
  
    test("handles database errors", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { query: { username: "testUser" } };
      const res = mockResponse();
  
      await ProfileController.GetStats(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: "Server error" 
      });
    });
  });

  describe("SetTimeLimit", () => {
    test("updates time limit successfully", async () => {
      const mockUser = {
        timeLimit: 60,
        markModified: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);

      const req = { body: { username: "testUser", timeLimit: 120 } };
      const res = mockResponse();

      await ProfileController.SetTimeLimit(req, res);
      expect(mockUser.timeLimit).toBe(120);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Time limit updated"
      });
    });

    test("handles database errors in SetTimeLimit", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { body: { username: "testUser", timeLimit: 120 } };
      const res = mockResponse();
    
      await ProfileController.SetTimeLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error"
      });
    });

    test("returns 404 when user not found in SetTimeLimit", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { body: { username: "nonexistent", timeLimit: 120 } };
      const res = mockResponse();
    
      await ProfileController.SetTimeLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found"
      });
    });

    test("rejects invalid time limits", async () => {
      const req = { body: { username: "testUser", timeLimit: -10 } };
      const res = mockResponse();

      await ProfileController.SetTimeLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid time limit"
      });
    });
  });

  describe("SetMoneyLimit", () => {
    test("updates money limit successfully", async () => {
      const mockUser = {
        moneyLimit: 200,
        markModified: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);

      const req = { body: { username: "testUser", moneyLimit: 500 } };
      const res = mockResponse();

      await ProfileController.SetMoneyLimit(req, res);
      expect(mockUser.moneyLimit).toBe(500);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Money limit updated"
      });
    });

    test("handles database errors in SetMoneyLimit", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      const req = { body: { username: "testUser", moneyLimit: 500 } };
      const res = mockResponse();
    
      await ProfileController.SetMoneyLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error"
      });
    });
    
    test("returns 404 when user not found in SetMoneyLimit", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { body: { username: "nonexistent", moneyLimit: 500 } };
      const res = mockResponse();
    
      await ProfileController.SetMoneyLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found"
      });
    });

    test("rejects invalid money limits", async () => {
      const req = { body: { username: "testUser", moneyLimit: -50 } };
      const res = mockResponse();

      await ProfileController.SetMoneyLimit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid money limit"
      });
    });
  });
});