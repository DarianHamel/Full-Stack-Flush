const { bet } = require("../Controllers/BetController");
const User = require("../Models/UserModel");

jest.mock("../Models/UserModel");

describe("Bet Controller - Unit Tests", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { body: { username: "testUser", money: 100 } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("Input Validation", () => {
    test("rejects negative bet amounts", async () => {
      mockReq.body.money = -50;
      await bet(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Bet amount must be positive" });
    });

    test("rejects zero bet amounts", async () => {
      mockReq.body.money = 0;
      await bet(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("rejects non-numeric bet amounts", async () => {
      mockReq.body.money = "invalid";
      await bet(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: "Bet amount must be a number" 
      });
    });
  });

  describe("User Validation", () => {
    test("returns 404 if user not found", async () => {
      User.findOne.mockResolvedValue(null);
      await bet(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("returns 400 if user has insufficient balance", async () => {
      User.findOne.mockResolvedValue({ balance: 50 });
      await bet(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Successful Bets", () => {
    test("deducts money from balance", async () => {
      const user = { 
        balance: 500, 
        save: jest.fn().mockResolvedValue(true), 
        markModified: jest.fn(),
        numLogins: 3
      };
      User.findOne.mockResolvedValue(user);

      await bet(mockReq, mockRes);

      expect(user.balance).toBe(400);
      expect(user.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test("returns updated balance", async () => {
      const user = { 
        balance: 500, 
        save: jest.fn().mockResolvedValue(true), 
        markModified: jest.fn(),
        numLogins: 3
      };
      User.findOne.mockResolvedValue(user);

      await bet(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ 
        money: 400, 
        message: "" 
      });
    });
  });

  describe("Spending Habits", () => {
    test("does not show spending message for new users (<5 logins)", async () => {
      const user = {
        balance: 500,
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        numLogins: 3,
        dailyMoneySpent: 100,
        moneySpent: 300
      };
      User.findOne.mockResolvedValue(user);

      await bet(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        money: 400,
        message: ""
      });
    });

    test("shows spending warning when above average", async () => {
      const user = {
        balance: 500,
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        numLogins: 6,
        dailyMoneySpent: 200,
        moneySpent: 1000
      };
      User.findOne.mockResolvedValue(user);

      await bet(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        money: 400,
        message: "You're spending more than your average daily amount"
      });
    });

    test("does not show warning when spending is normal", async () => {
      const user = {
        balance: 500,
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        numLogins: 6,
        dailyMoneySpent: 50,
        moneySpent: 1000
      };
      User.findOne.mockResolvedValue(user);

      await bet(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        money: 400,
        message: ""
      });
    });
  });

  describe("Error Handling", () => {
    test("handles database errors", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      await bet(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test("handles save errors", async () => {
      const user = { 
        balance: 500, 
        save: jest.fn().mockRejectedValue(new Error("Save failed")), 
        markModified: jest.fn(),
        numLogins: 3
      };
      User.findOne.mockResolvedValue(user);

      await bet(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("Edge Cases", () => {
    test("handles decimal bet amounts", async () => {
      mockReq.body.money = 50.25;
      const user = { 
        balance: 100, 
        save: jest.fn().mockResolvedValue(true), 
        markModified: jest.fn(),
        numLogins: 3
      };
      User.findOne.mockResolvedValue(user);

      await bet(mockReq, mockRes);

      expect(user.balance).toBeCloseTo(49.75);
    });

    test("handles zero balance after bet", async () => {
      mockReq.body.money = 500;
      const user = { 
        balance: 500, 
        save: jest.fn().mockResolvedValue(true), 
        markModified: jest.fn(),
        numLogins: 3
      };
      User.findOne.mockResolvedValue(user);

      await bet(mockReq, mockRes);

      expect(user.balance).toBe(0);
    });
  });

  describe("Average Daily Spending Calculation", () => {
    test("handles zero logins case by defaulting to 0", async () => {
      const user = {
        balance: 500,
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        numLogins: 0, // This will cause division by zero
        dailyMoneySpent: 100,
        moneySpent: 300
      };
      User.findOne.mockResolvedValue(user);
  
      await bet(mockReq, mockRes);
  
      // Verify no spending message is shown
      expect(mockRes.json).toHaveBeenCalledWith({
        money: 400,
        message: ""
      });
    });
  
    test("handles NaN case in average calculation", async () => {
      const user = {
        balance: 500,
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        numLogins: 6,
        dailyMoneySpent: "invalid", // Will cause NaN in calculation
        moneySpent: 1000
      };
      User.findOne.mockResolvedValue(user);
  
      await bet(mockReq, mockRes);
  
      // Verify the OR operator (|| 0) works
      expect(mockRes.json).toHaveBeenCalledWith({
        money: 400,
        message: ""
      });
    });
  });
});