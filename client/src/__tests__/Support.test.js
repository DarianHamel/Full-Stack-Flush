import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Support from "../components/profile/Support";

describe("Support Component", () => {
  test("renders the support hotline information", () => {
    render(<Support />);

    // Check for the hotline text
    expect(screen.getByText("GAMBLING CANADIAN HOTLINE")).toBeInTheDocument();
    expect(screen.getByText("1-800-GAMBLER")).toBeInTheDocument();
  });
});