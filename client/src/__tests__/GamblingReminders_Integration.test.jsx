import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { toast } from "react-toastify";
import GamblingReminders from "../components/GamblingReminders";
import { act } from "react-dom/test-utils";

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    info: jest.fn(),
  },
}));

describe("GamblingReminders Integration Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("triggers gambling reminders within a simulated app", () => {
    render(<GamblingReminders />);
    
    act(() => {
      jest.advanceTimersByTime(60000); // Simulate 60 seconds passing
    });

    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(typeof toast.info.mock.calls[0][0]).toBe("string"); // Ensure message is a valid string

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(toast.info).toHaveBeenCalledTimes(2);
    expect(toast.info.mock.calls[0][0]).not.toBe(toast.info.mock.calls[1][0]); // Ensure different messages
  });

  test("stops showing reminders when component is unmounted", () => {
    const { unmount } = render(<GamblingReminders />);

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(toast.info).toHaveBeenCalledTimes(1);

    unmount(); // Remove component

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(toast.info).toHaveBeenCalledTimes(1); // No new reminders after unmounting
  });
});
