import axios from "axios";
import { checkAndResetDailyValues, updateTimeSpent, fetchUserBalance, fetchUserLimits, } from "../components/helpers/userInfoHelper";

jest.mock("axios");

describe("UserInfoHelper Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 1 -- Test checkAndResetDailyValues with a different day
  test("checkAndResetDailyValues should reset daily limits if last login is a different day", async () => {
    const mockUsername = "testUser";
    axios.get.mockResolvedValueOnce({
      data: { lastLogin: new Date(Date.now() - 86400000).toISOString() },
    });
    axios.post.mockResolvedValueOnce({});

    await checkAndResetDailyValues(mockUsername);

    expect(axios.get).toHaveBeenCalledWith("http://localhost:5050/getLastLogin", {
      params: { username: mockUsername },
    });
    expect(axios.post).toHaveBeenCalledWith("http://localhost:5050/resetDailyLimits", {
      username: mockUsername,
    });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  // 2 -- Test checkAndResetDailyValues with the same day
  test("checkAndResetDailyValues should not reset daily limits if last login is today", async () => {
    const mockUsername = "testUser";
    axios.get.mockResolvedValueOnce({
      data: { lastLogin: new Date().toISOString() },
    });

    await checkAndResetDailyValues(mockUsername);

    expect(axios.get).toHaveBeenCalledWith("http://localhost:5050/getLastLogin", {
      params: { username: mockUsername },
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  // 3 -- Test checkAndResetDailyValues with an error
  test("checkAndResetDailyValues should log an error if the API call fails", async () => {
    const mockUsername = "testUser";
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("API error"));

    await checkAndResetDailyValues(mockUsername);

    expect(axios.get).toHaveBeenCalledWith("http://localhost:5050/getLastLogin", {
      params: { username: mockUsername },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error checking and resetting daily values:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  // 4 -- Test updateTimeSpent with a successful update
  test("updateTimeSpent should call the API to update time spent", async () => {
    const mockUsername = "testUser";
    const mockTimeSpent = 120;
    axios.post.mockResolvedValueOnce({});

    await updateTimeSpent(mockUsername, mockTimeSpent);

    expect(axios.post).toHaveBeenCalledWith("http://localhost:5050/setTimeSpent", {
      username: mockUsername,
      timeSpent: mockTimeSpent,
    });
  });

  // 5 -- Test updateTimeSpent with an error
  test("updateTimeSpent should log an error if the API call fails", async () => {
    const mockUsername = "testUser";
    const mockTimeSpent = 120;
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    axios.post.mockRejectedValueOnce(new Error("API error"));

    await updateTimeSpent(mockUsername, mockTimeSpent);

    expect(axios.post).toHaveBeenCalledWith("http://localhost:5050/setTimeSpent", {
      username: mockUsername,
      timeSpent: mockTimeSpent,
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "A problem occurred updating time spent: ",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  // 6 -- Test fetchUserBalance with a successful response
  test("fetchUserBalance should return the user's balance", async () => {
    const mockUsername = "testUser";
    axios.get.mockResolvedValueOnce({ data: { balance: 500 } });

    const balance = await fetchUserBalance(mockUsername);

    expect(axios.get).toHaveBeenCalledWith("http://localhost:5050/getBalance", {
      params: { username: mockUsername },
    });
    expect(balance).toBe(500);
  });

  // 7 -- Test fetchUserBalance with an error
  test("fetchUserBalance should log an error if the API call fails", async () => {
    const mockUsername = "testUser";
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("API error"));

    const balance = await fetchUserBalance(mockUsername);

    expect(axios.get).toHaveBeenCalledWith("http://localhost:5050/getBalance", {
      params: { username: mockUsername },
    });
    expect(balance).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching user balance:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  // 8 -- Test fetchUserLimits with a successful response
  test("fetchUserLimits should return the user's limits", async () => {
    const mockUsername = "testUser";
    const mockLimits = { timeLimit: 120, moneyLimit: 1000 };
    axios.get.mockResolvedValueOnce({ data: mockLimits });

    const limits = await fetchUserLimits(mockUsername);

    expect(axios.get).toHaveBeenCalledWith("http://localhost:5050/getLimits", {
      params: { username: mockUsername },
    });
    expect(limits).toEqual(mockLimits);
  });

  // 9 -- Test fetchUserLimits with an error
  test("fetchUserLimits should log an error if the API call fails", async () => {
    const mockUsername = "testUser";
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("API error"));

    const limits = await fetchUserLimits(mockUsername);

    expect(axios.get).toHaveBeenCalledWith("http://localhost:5050/getLimits", {
      params: { username: mockUsername },
    });
    expect(limits).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching user limits:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});