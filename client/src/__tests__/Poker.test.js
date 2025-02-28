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
    expect(screen.getByText("Coming Soon!")).toBeInTheDocument();
    expect(screen.getByText("♠️ Poker Game ♥️")).toBeInTheDocument();
    expect(screen.getByText(/We’re working hard to bring you an immersive poker experience/i)).toBeInTheDocument();
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });
});
