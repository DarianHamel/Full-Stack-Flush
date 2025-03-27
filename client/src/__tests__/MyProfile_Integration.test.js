import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import MyProfile from "../components/profile/MyProfile";
import { CookiesProvider } from "react-cookie";
import { Cookies } from "react-cookie";

describe("MyProfile Component", () => {
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

  test("does not fetch user profile if cookies are not set", async () => {
    // Render the component without setting a username cookie
    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Check that the username is not fetched and remains empty
    await waitFor(() => {
      expect(screen.queryByText("testuser")).not.toBeInTheDocument();
    });

    // Ensure that the API call was not made
    expect(mock.history.get.length).toBe(0);
  });

  test("renders the user profile on page load", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user profile
    mock.onGet(/userInfo/).reply(200, {
      username: "testuser",
      timeLimit: 3600,
      moneyLimit: 1500,
    });

    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Wait for the user profile to be displayed
    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("********")).toBeInTheDocument();
      expect(screen.getByText("60")).toBeInTheDocument(); // timeLimit in minutes
      expect(screen.getByText("1500")).toBeInTheDocument();
    });
  });

  test("displays an error message if fetching user profile fails", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user profile failure
    mock.onGet(/userInfo/).reply(500);

    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText("Error fetching user profile.")).toBeInTheDocument();
    });
  });

  test("allows the user to edit and save the time limit", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user profile
    mock.onGet(/userInfo/).reply(200, {
      username: "testuser",
      timeLimit: 3600,
      moneyLimit: 1500,
    });

    // Mock API response for setting time limit
    mock.onPost(/SetTimeLimit/).reply(200);

    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Wait for the user profile to be displayed
    await waitFor(() => {
      expect(screen.getByText("60")).toBeInTheDocument(); // timeLimit in minutes
    });

    // Click the Edit button for time limit
    fireEvent.click(screen.getAllByText("Edit")[0]); // Press the first edit button

    // Change the time limit
    fireEvent.change(screen.getByDisplayValue("60"), { target: { value: "120" } });

    // Click the Save button
    fireEvent.click(screen.getByText("Save"));

    // Wait for the time limit to be updated
    await waitFor(() => {
      expect(screen.getByText("120")).toBeInTheDocument(); // updated timeLimit in minutes
    });
  });

  test("displays an error message if setting time limit fails", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user profile
    mock.onGet(/userInfo/).reply(200, {
      username: "testuser",
      timeLimit: 3600,
      moneyLimit: 1500,
    });

    // Mock API response for setting time limit failure
    mock.onPost(/SetTimeLimit/).reply(500);

    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Wait for the user profile to be displayed
    await waitFor(() => {
      expect(screen.getByText("60")).toBeInTheDocument(); // timeLimit in minutes
    });

    // Click the Edit button for time limit
    fireEvent.click(screen.getAllByText("Edit")[0]); // Press the first edit button

    // Change the time limit
    fireEvent.change(screen.getByDisplayValue("60"), { target: { value: "120" } });

    // Click the Save button
    fireEvent.click(screen.getByText("Save"));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText("Error setting time limit.")).toBeInTheDocument();
    });
  });

  test("allows the user to edit and save the money limit", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user profile
    mock.onGet(/userInfo/).reply(200, {
      username: "testuser",
      timeLimit: 3600,
      moneyLimit: 1500,
    });

    // Mock API response for setting money limit
    mock.onPost(/SetMoneyLimit/).reply(200);

    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Wait for the user profile to be displayed
    await waitFor(() => {
      expect(screen.getByText("1500")).toBeInTheDocument(); // moneyLimit
    });

    // Click the Edit button for money limit
    fireEvent.click(screen.getAllByText("Edit")[1]); // Press the second edit button

    // Change the money limit
    fireEvent.change(screen.getByDisplayValue("1500"), { target: { value: "2000" } });

    // Click the Save button
    fireEvent.click(screen.getByText("Save"));

    // Wait for the money limit to be updated
    await waitFor(() => {
      expect(screen.getByText("2000")).toBeInTheDocument(); // updated moneyLimit
    });
  });

  test("displays an error message if setting money limit fails", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user profile
    mock.onGet(/userInfo/).reply(200, {
      username: "testuser",
      timeLimit: 3600,
      moneyLimit: 1500,
    });

    // Mock API response for setting money limit failure
    mock.onPost(/SetMoneyLimit/).reply(500);

    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Wait for the user profile to be displayed
    await waitFor(() => {
      expect(screen.getByText("1500")).toBeInTheDocument(); // moneyLimit
    });

    // Click the Edit button for money limit
    fireEvent.click(screen.getAllByText("Edit")[1]); // Press the second edit button

    // Change the money limit
    fireEvent.change(screen.getByDisplayValue("1500"), { target: { value: "2000" } });

    // Click the Save button
    fireEvent.click(screen.getByText("Save"));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText("Error setting money limit.")).toBeInTheDocument();
    });
  });

  test("allows the user to cancel editing the time limit", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user profile
    mock.onGet(/userInfo/).reply(200, {
      username: "testuser",
      timeLimit: 3600,
      moneyLimit: 1500,
    });

    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Wait for the user profile to be displayed
    await waitFor(() => {
      expect(screen.getByText("60")).toBeInTheDocument(); // timeLimit in minutes
    });

    // Click the Edit button for time limit
    fireEvent.click(screen.getAllByText("Edit")[0]); // Press the first edit button

    // Click the Cancel button
    fireEvent.click(screen.getByText("Cancel"));

    // Wait for the time limit to be displayed without changes
    await waitFor(() => {
      expect(screen.getByText("60")).toBeInTheDocument(); // timeLimit in minutes
    });
  });

  test("allows the user to cancel editing the money limit", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for user profile
    mock.onGet(/userInfo/).reply(200, {
      username: "testuser",
      timeLimit: 3600,
      moneyLimit: 1500,
    });

    render(
      <CookiesProvider cookies={cookies}>
        <MyProfile />
      </CookiesProvider>
    );

    // Wait for the user profile to be displayed
    await waitFor(() => {
      expect(screen.getByText("1500")).toBeInTheDocument(); // moneyLimit
    });

    // Click the Edit button for money limit
    fireEvent.click(screen.getAllByText("Edit")[1]); // Press the second edit button

    // Click the Cancel button
    fireEvent.click(screen.getByText("Cancel"));

    // Wait for the money limit to be displayed without changes
    await waitFor(() => {
      expect(screen.getByText("1500")).toBeInTheDocument(); // moneyLimit
    });
  });
});