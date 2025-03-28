const { getHistory, makeHistory } = require("../Controllers/HistoryController");
const History = require("../Models/HistoryModel");
const User = require("../Models/UserModel");

jest.setTimeout(60000);

jest.mock("../Models/HistoryModel");
jest.mock("../Models/UserModel");

describe("History Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe("getHistory", () => {
    it("should return 404 if username is missing", async () => {
      mockReq.query = {};
      await getHistory(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Username is required" });
    });

    it("should return 400 if no transactions exist", async () => {
      mockReq.query = { username: "testUser" };
      History.find.mockResolvedValue([]);
      await getHistory(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "No transactions were made yet" });
    });

    it("should return transactions if they exist", async () => {
      const mockHistory = [{ transaction: 100, game: "Blackjack" }];
      mockReq.query = { username: "testUser" };
      History.find.mockResolvedValue(mockHistory);
      await getHistory(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockHistory);
    });

    it("should handle server errors", async () => {
      mockReq.query = { username: "testUser" };
      History.find.mockRejectedValue(new Error("DB Error"));
      await getHistory(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("makeHistory", () => {
    beforeEach(() => {
      mockReq.body = {
        username: "testUser",
        transaction: 100,
        game: "Blackjack",
        day: "2023-01-01"
      };
    });

    it("should return 404 if required parameters are missing", async () => {
      mockReq.body = {};
      await makeHistory(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Needed parameters needed" });
    });

    it("should return 400 if user doesn't exist", async () => {
      User.findOne.mockResolvedValue(null);
      await makeHistory(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Cannot locate user" });
    });

    it("should return 400 for invalid game type", async () => {
      mockReq.body.game = "InvalidGame";
      User.findOne.mockResolvedValue({});
      await makeHistory(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Game is not found" });
    });

    it("should create history for valid deposit", async () => {
      mockReq.body.game = "Deposit";
      User.findOne.mockResolvedValue({});
      History.create.mockResolvedValue({});
      await makeHistory(mockReq, mockRes);
      expect(History.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should create history for valid game", async () => {
      User.findOne.mockResolvedValue({});
      History.create.mockResolvedValue({});
      await makeHistory(mockReq, mockRes);
      expect(History.create).toHaveBeenCalledWith({
        username: "testUser",
        transaction: 100,
        game: "Blackjack",
        day: "2023-01-01"
      });
    });

    it("should handle server errors", async () => {
      User.findOne.mockRejectedValue(new Error("DB Error"));
      await makeHistory(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});