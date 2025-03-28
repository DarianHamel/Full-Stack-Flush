import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Profile from "../components/Profile";


// Mock the AuthRedirect component
jest.mock("../components/AuthRedirect", () => ({ children }) => <div>{children}</div>);


jest.mock("react-icons/fa", () => {
    return {
      FaUser: () => <span>FaUser</span>,
      FaWallet: () => <span>FaWallet</span>,
      FaChartBar: () => <span>FaChartBar</span>,
      FaHeadset: () => <span>FaHeadset</span>,
      FaHistory: () => <span>FaHistory</span>,
    };
  });

describe("Profile Component Integration Tests", () => {
  const username = "testuser";

  test("renders the default profile panel and username", () => {
    render(<Profile username={username} />);

    // Check that the username is displayed
    expect(screen.getByText(`@${username}`)).toBeInTheDocument();

    // Check that the default panel (My Profile) is displayed
    expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
  });

  test("switches to the Balance panel when the Balance button is clicked", () => {
    render(<Profile username={username} />);

    // Click the Balance button
    fireEvent.click(screen.getByText(/Balance/i));

    // Check that the Balance panel is displayed
    expect(screen.getByText(/Current Balance:/i)).toBeInTheDocument();
  });

  test("switches to the Stats panel when the Stats button is clicked", () => {
    render(<Profile username={username} />);

    // Click the Stats button
    fireEvent.click(screen.getByText(/Stats/i));

    // Check that the Stats panel is displayed
    expect(screen.getByText(/User Stats/i)).toBeInTheDocument();
  });

  test("switches to the Support panel when the Support button is clicked", () => {
    render(<Profile username={username} />);

    // Click the Support button
    fireEvent.click(screen.getByText(/Support/i));

    // Check that the Support panel is displayed
    expect(screen.getByText(/Support/i)).toBeInTheDocument();
  });

  test("switches to the History panel when the History button is clicked", () => {
    render(<Profile username={username} />);

    // Click the History button
    fireEvent.click(screen.getByText(/FaHistory/i));

    // Check that the History panel is displayed
    expect(screen.getAllByText(/Transaction History/i)[0]).toBeInTheDocument();
  });

  test("test switching from one panel to MyProfile panel", () => {
    render(<Profile username={username} />);

    // Click the Balance button
    fireEvent.click(screen.getByText(/Balance/i));

    // Check that the Balance panel is displayed
    expect(screen.getByText(/Current Balance:/i)).toBeInTheDocument();

    // Click the My Profile button
    fireEvent.click(screen.getByText(/My Profile/i));

    // Check that the Stats panel is displayed
    expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
  });
});