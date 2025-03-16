import React from 'react';
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from '../components/Signup';
import axios from "axios";
import { BrowserRouter as Router} from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Mock Axios
jest.mock("axios");

describe("Signup Component", () => {
  const mockOnClose = jest.fn();
  const mockSetShowLogin = jest.fn();

  const renderSignup = () =>
    render(
      <Router>
        <Signup show={true} onClose={mockOnClose} setShowLogin={mockSetShowLogin} />
        <ToastContainer />
      </Router>
    );

  test("renders the signup modal when show is true", () => {
    renderSignup();
    expect(screen.getByText("Register Now!")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    renderSignup();
    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpassword" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("testpassword");
  });

  test("handles successful signup", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, message: "Signup successful" } });

    renderSignup();

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "testpassword" } });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
        const successMessages = screen.getAllByText("Signup successful");
      expect(successMessages.length).toBeGreaterThan(0);
    });
  });

  test("handles signup failure", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: false, message: "Signup failed" } });

    renderSignup();

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "testpassword" } });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
        const errorMessages = screen.getAllByText("Signup failed");
        expect(errorMessages.length).toBeGreaterThan(0); // ✅ Fix: Expect at least one match
      });
  });

  test("closes modal when close button is clicked", () => {
    renderSignup();
    fireEvent.click(screen.getByText("Close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("switches to login form when login button is clicked", () => {
    renderSignup();
    fireEvent.click(screen.getByText("Login"));
    expect(mockSetShowLogin).toHaveBeenCalledWith(true);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
