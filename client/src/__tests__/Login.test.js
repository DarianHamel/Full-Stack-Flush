import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../components/Login";

jest.mock("react-toastify", () => ({
    toast: {
      error: jest.fn(),
      success: jest.fn(),
    },
    ToastContainer: () => <div />,
  }));
  

jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: { success: true, message: "Login successful" } }))
}));

describe("Login Component", () => {
 
  test("does not render when show is false", () => {
    const { container } = render(<Login show={false} onClose={jest.fn()} setShowSignup={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });


});
