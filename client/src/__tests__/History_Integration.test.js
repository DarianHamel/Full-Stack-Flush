import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import History from "../components/profile/History";
import { CookiesProvider } from "react-cookie";
import { Cookies } from "react-cookie";

describe("History Component", () => {
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

  test("does not fetch transaction history if no username is provided", async () => {
    // Render the component without setting a username cookie
    render(
      <CookiesProvider cookies={cookies}>
        <History />
      </CookiesProvider>
    );

    // Check that the "No transaction history found." message is displayed
    await waitFor(() => {
      expect(screen.getByText("No transaction history found.")).toBeInTheDocument();
    });

    // Ensure that the API call was not made
    expect(mock.history.get.length).toBe(0);
  });

  test("renders the transaction history on page load", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for transaction history
    mock.onGet(/getHistory/).reply(200, [
      { game: "Poker", day: "2023-03-25T12:00:00Z", transaction: 100 },
      { game: "Blackjack", day: "2023-03-24T12:00:00Z", transaction: -50 },
    ]);

    render(
      <CookiesProvider cookies={cookies}>
        <History />
      </CookiesProvider>
    );

    // Wait for the transaction history to be displayed
    await waitFor(() => {
      expect(screen.getByText("Poker")).toBeInTheDocument();
      expect(screen.getByText("Blackjack")).toBeInTheDocument();
      expect(screen.getByText("$100")).toBeInTheDocument();
      expect(screen.getByText("$-50")).toBeInTheDocument();
    });
  });

  test("displays a message when there is no transaction history", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for empty transaction history
    mock.onGet(/getHistory/).reply(200, []);

    render(
      <CookiesProvider cookies={cookies}>
        <History />
      </CookiesProvider>
    );

    // Wait for the no transaction history message to be displayed
    await waitFor(() => {
      expect(screen.getByText("No transaction history found.")).toBeInTheDocument();
    });
  });

  test("handles API errors gracefully", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for error
    mock.onGet(/getHistory/).reply(500);

    render(
      <CookiesProvider cookies={cookies}>
        <History />
      </CookiesProvider>
    );

    // Wait for the no transaction history message to be displayed
    await waitFor(() => {
      expect(screen.getByText("No transaction history found.")).toBeInTheDocument();
    });
  });
});