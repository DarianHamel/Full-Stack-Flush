import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Balance from "../components/profile/Balance";
import { CookiesProvider } from "react-cookie";
import { Cookies } from "react-cookie";

describe("Balance Component", () => {
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

  test("does not fetch balance if no username cookie is set", async () => {
    // Render the component without setting a username cookie
    render(
      <CookiesProvider cookies={cookies}>
        <Balance />
      </CookiesProvider>
    );

    // Check that the balance is not fetched and remains at the initial value
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'strong' && content.includes('$0');
      })).toBeInTheDocument();
    });

    // Ensure that the API call was not made
    expect(mock.history.get.length).toBe(0);
  });

  test("renders the current balance on page load", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for balance
    mock.onGet(/balance/).reply(200, {
      balance: 1000,
    });

    render(
      <CookiesProvider cookies={cookies}>
        <Balance />
      </CookiesProvider>
    );

    // Wait for the balance to be displayed
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'strong' && content.includes('$1000');
      })).toBeInTheDocument();
      expect(screen.getByText(/Current Balance:/)).toBeInTheDocument();
    });
  });

  test("displays an error message if required fields are missing", async () => {
    render(
      <CookiesProvider cookies={cookies}>
        <Balance />
      </CookiesProvider>
    );

    // Click the Confirm Deposit button without filling in the fields
    fireEvent.click(screen.getByText("Confirm Deposit"));

    // Check for the error message
    expect(screen.getByText("All fields are required.")).toBeInTheDocument();
  });

  test("displays an error message if deposit amount is not a positive number", async () => {
    render(
      <CookiesProvider cookies={cookies}>
        <Balance />
      </CookiesProvider>
    );

    // Fill in the fields with invalid deposit amount
    fireEvent.change(screen.getByPlaceholderText("Enter deposit amount"), { target: { value: "-100" } });
    fireEvent.change(screen.getByPlaceholderText("Card Number"), { target: { value: "1234567890123456" } });
    fireEvent.change(screen.getByPlaceholderText("Expiration Date (MM/YY)"), { target: { value: "12/34" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmation Number"), { target: { value: "123" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password" } });

    // Click the Confirm Deposit button
    fireEvent.click(screen.getByText("Confirm Deposit"));

    // Check for the error message
    expect(screen.getByText("Deposit amount must be a positive number.")).toBeInTheDocument();
  });

  test("updates the balance after a successful deposit", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for balance
    mock.onGet(/balance/).reply(200, {
      balance: 1000,
    });

    // Mock API response for deposit
    mock.onPost(/update-balance/).reply(200, {
      success: true,
      balance: 1100,
    });

    render(
      <CookiesProvider cookies={cookies}>
        <Balance />
      </CookiesProvider>
    );

    // Fill in the fields with valid data
    fireEvent.change(screen.getByPlaceholderText("Enter deposit amount"), { target: { value: "100" } });
    fireEvent.change(screen.getByPlaceholderText("Card Number"), { target: { value: "1234567890123456" } });
    fireEvent.change(screen.getByPlaceholderText("Expiration Date (MM/YY)"), { target: { value: "12/34" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmation Number"), { target: { value: "123" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password" } });

    // Click the Confirm Deposit button
    fireEvent.click(screen.getByText("Confirm Deposit"));

    // Wait for the balance to be updated
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'strong' && content.includes('$1100');
      })).toBeInTheDocument();
      expect(screen.getByText(/Current Balance:/)).toBeInTheDocument();
    });
  });

  test("displays an error message if the deposit fails", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for balance
    mock.onGet(/balance/).reply(200, {
      balance: 1000,
    });

    // Mock API response for deposit failure
    mock.onPost(/update-balance/).reply(200, {
      success: false,
    });

    render(
      <CookiesProvider cookies={cookies}>
        <Balance />
      </CookiesProvider>
    );

    // Fill in the fields with valid data
    fireEvent.change(screen.getByPlaceholderText("Enter deposit amount"), { target: { value: "100" } });
    fireEvent.change(screen.getByPlaceholderText("Card Number"), { target: { value: "1234567890123456" } });
    fireEvent.change(screen.getByPlaceholderText("Expiration Date (MM/YY)"), { target: { value: "12/34" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmation Number"), { target: { value: "123" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password" } });

    // Click the Confirm Deposit button
    fireEvent.click(screen.getByText("Confirm Deposit"));

    // Check for the error message
    await waitFor(() => {
      expect(screen.getByText("Incorrect password or transaction failed.")).toBeInTheDocument();
    });
  });

  test("displays an error message if the API call fails", async () => {
    // Set the username cookie
    cookies.set("username", "testuser");

    // Mock API response for balance
    mock.onGet(/balance/).reply(200, {
      balance: 1000,
    });

    // Mock API response for deposit failure with 500 error
    mock.onPost(/update-balance/).reply(500);

    render(
      <CookiesProvider cookies={cookies}>
        <Balance />
      </CookiesProvider>
    );

    // Fill in the fields with valid data
    fireEvent.change(screen.getByPlaceholderText("Enter deposit amount"), { target: { value: "100" } });
    fireEvent.change(screen.getByPlaceholderText("Card Number"), { target: { value: "1234567890123456" } });
    fireEvent.change(screen.getByPlaceholderText("Expiration Date (MM/YY)"), { target: { value: "12/34" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmation Number"), { target: { value: "123" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password" } });

    // Click the Confirm Deposit button
    fireEvent.click(screen.getByText("Confirm Deposit"));

    // Check for the error message
    await waitFor(() => {
      expect(screen.getByText("Transaction failed. Please try again.")).toBeInTheDocument();
    });
  });
});