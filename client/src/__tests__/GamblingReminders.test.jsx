import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { toast } from "react-toastify";
import GamblingReminders from "../components/GamblingReminders";

jest.mock("react-toastify", () => ({
  toast: {
    info: jest.fn()
  }
}));

describe("GamblingReminders Component - Unit tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("displays gambling facts at intervals", () => {
    render(<GamblingReminders />);

    jest.advanceTimersByTime(60000);
    expect(toast.info).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(60000); 
    expect(toast.info).toHaveBeenCalledTimes(2);
  });

  test("shows a different gambling fact on each call", () => {
    render(<GamblingReminders />);

    jest.advanceTimersByTime(60000);
    jest.advanceTimersByTime(60000);

    expect(toast.info).toHaveBeenCalledTimes(2);
    expect(toast.info.mock.calls[0][0]).not.toBe(toast.info.mock.calls[1][0]);
  });

  test("No reminders appear before the first 60 seconds", () => {
    render(<GamblingReminders />);

    jest.advanceTimersByTime(59000); // Just before the first reminder
    expect(toast.info).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000); // Now at 60 seconds
    expect(toast.info).toHaveBeenCalledTimes(1);
  });

  test("clears the interval when the component unmounts", () => {
    const { unmount } = render(<GamblingReminders />);
  
    jest.advanceTimersByTime(60000); 
    expect(toast.info).toHaveBeenCalledTimes(1);
  
    unmount(); // Simulate component unmounting
  
    jest.advanceTimersByTime(60000);
    expect(toast.info).toHaveBeenCalledTimes(1); // Should remain the same, meaning no more reminders fired
  });
  
  test("ensures gambling facts are valid messages", () => {
    render(<GamblingReminders />);
  
    jest.advanceTimersByTime(60000);
    
    const displayedMessage = toast.info.mock.calls[0][0];
    expect(displayedMessage).toBeTruthy(); // Ensures message is not empty
    expect(typeof displayedMessage).toBe("string");
  });  
});
