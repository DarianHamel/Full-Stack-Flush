import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Poker from "../components/Poker";

describe("Poker Component", () => {
  test("renders the Poker component", () => {
    render(
      <Router>
        <Poker />
      </Router>
    );
    expect(screen.getByText("♠️ Poker Minigame ♥️")).toBeInTheDocument();
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });
});
