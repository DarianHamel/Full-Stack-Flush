import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Leaderboard from "../components/Leaderboard";

describe("Leaderboard Component", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.reset();
  });

  afterEach(() => {
    mock.restore();
  });

  test("renders sorting dropdown options", async () => {
    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("Username")).toBeInTheDocument();
      expect(screen.getByText("Wins")).toBeInTheDocument();
      expect(screen.getByText("Losses")).toBeInTheDocument();
      expect(screen.getByText("Win/Loss Ratio")).toBeInTheDocument();
      expect(screen.getByText("Money Spent")).toBeInTheDocument();
      expect(screen.getByText("Time Spent")).toBeInTheDocument();
    });
  });

  test("displays leaderboard data when API call succeeds", async () => {
    // Mock API response
    mock.onGet(/leaderboard/).reply(200, [
      {
        _id: "1",
        username: "Player1",
        wins: 10,
        losses: 5,
        winLossRatio: 2.0,
        moneySpent: 1500,
        timeSpent: 100,
      },
    ]);

    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    // Wait for the data to be displayed
    await waitFor(() => {
      expect(screen.getByText("Player1")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1.5K")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  test("displays 'No data available' when API returns an empty array", async () => {
    // Mock empty API response
    mock.onGet(/leaderboard/).reply(200, []);

    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });

  test("displays an error message when API call fails", async () => {
    // Mock failed API response
    mock.onGet(/leaderboard/).reply(500);

    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    }, { timeout: 5000 }); 
  });
});
