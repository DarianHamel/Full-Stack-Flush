import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Stats from "../components/profile/Stats";
import { CookiesProvider } from "react-cookie";
import { Cookies } from "react-cookie";

describe("Stats Component", () => {
  let mock;
  let cookies;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.reset();
    cookies = new Cookies();
  });

  afterEach(() => {
    mock.restore();
  });

  test("does not fetch user stats if no username is provided", async () => {
    // Render the component without setting a username cookie
    render(
      <CookiesProvider cookies={cookies}>
        <Stats />
      </CookiesProvider>
    );

    // Check that the error message is not displayed
    await waitFor(() => {
      expect(screen.queryByText(/Error fetching user stats for:/)).not.toBeInTheDocument();
    });

    // Ensure that the API call was not made
    expect(mock.history.get.length).toBe(0);
  });

  test("renders the user stats on page load", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user stats
    mock.onGet(/GetStats/).reply(200, {
      moneySpent: 500,
      timeSpent: 7200, // in seconds
      wins: 10,
      losses: 5,
    });

    render(
      <CookiesProvider cookies={cookies}>
        <Stats />
      </CookiesProvider>
    );

    // Wait for the user stats to be displayed
    await waitFor(() => {
      expect(screen.getByText("$500")).toBeInTheDocument();
      expect(screen.getByText("120 Minutes")).toBeInTheDocument(); // timeSpent in minutes
      expect(screen.getByText("10")).toBeInTheDocument(); // wins
      expect(screen.getByText("5")).toBeInTheDocument(); // losses
      expect(screen.getByText("0.67")).toBeInTheDocument(); // win/loss ratio
    });
  });

  test("handles API errors gracefully", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for error
    mock.onGet(/GetStats/).reply(500);

    render(
      <CookiesProvider cookies={cookies}>
        <Stats />
      </CookiesProvider>
    );

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(`Error fetching user stats for: testuser`)).toBeInTheDocument();
    });
  });
});