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

describe("GamblingReminders Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("displays gambling facts at intervals", () => {
    render(<GamblingReminders />);

    jest.advanceTimersByTime(60000); // Move forward 1 minute
    expect(toast.info).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(60000); // Move forward another minute
    expect(toast.info).toHaveBeenCalledTimes(2);
  });

  test("shows a different gambling fact on each call", () => {
    render(<GamblingReminders />);

    jest.advanceTimersByTime(60000);
    jest.advanceTimersByTime(60000);

    expect(toast.info).toHaveBeenCalledTimes(2);
    expect(toast.info.mock.calls[0][0]).not.toBe(toast.info.mock.calls[1][0]);
  });
});
