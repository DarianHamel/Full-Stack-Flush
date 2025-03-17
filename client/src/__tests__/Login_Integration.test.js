import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../components/Login";
import axios from "axios";
import { MemoryRouter as Router, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

// Mock Axios
jest.mock("axios");

// Mock Toastify
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  ToastContainer: () => <div />,
}));

// Mock useNavigate globally
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Login Component", () => {
  const mockOnClose = jest.fn();
  const mockSetShowSignup = jest.fn();
  const mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);


  beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { reload: jest.fn() };
  });

  // Mock axios globally
  axios.post.mockImplementation((url, data) => {
    if (data.username === "testuser") {
      return Promise.resolve({ data: { success: true, message: "Login successful" } });
    }
    return Promise.resolve({ data: { success: false, message: "Login failed" } });
  });

  const renderLogin = () =>
    render(
      <Router>
        <Login show={true} onClose={mockOnClose} setShowSignup={mockSetShowSignup} />
        <ToastContainer />
      </Router>
    );

  test("renders the login modal when show is true", () => {
    renderLogin();
    expect(screen.getByText("Login to your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    renderLogin();
    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpassword" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("testpassword");
  });

  test("handles successful login", async () => {
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "testpassword" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Login successful", expect.any(Object));
      });      

    expect(mockOnClose).toHaveBeenCalled();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith("/");

    expect(window.location.reload).toHaveBeenCalled();
  });

  test("handles login failure", async () => {
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "wronguser" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "wrongpassword" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Login failed", expect.any(Object));
      });      
  });

  test("closes modal when close button is clicked", () => {
    renderLogin();
    fireEvent.click(screen.getByText("Close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("switches to signup form when register button is clicked", () => {
    renderLogin();
    fireEvent.click(screen.getByText("Register"));
    expect(mockSetShowSignup).toHaveBeenCalledWith(true);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
