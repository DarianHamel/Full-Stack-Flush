import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import AboutUs from "../components/AboutUs";

describe("AboutUs - Integration Tests", () => {
  test("renders AboutUs component within the app", () => {
    render(
      <Router>
        <AboutUs />
      </Router>
    );

    expect(screen.getByRole("heading", { name: /about full stack flush/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /meet our team/i })).toBeInTheDocument();
  });

  test("ensures all team members are displayed", () => {
    render(
      <Router>
        <AboutUs />
      </Router>
    );

    const teamMembers = [
      "Mateo DeSousa", "Kaye Mendoza", "Darian Hamel",
      "Prashant Nigam", "Scott Barrett", "Chineze Obi"
    ];

    teamMembers.forEach(member => {
      expect(screen.getByText(member)).toBeInTheDocument();
    });
  });

  test("ensures responsible gambling features are highlighted", () => {
    render(
      <Router>
        <AboutUs />
      </Router>
    );

    expect(screen.getByText(/mandatory betting and time limits/i)).toBeInTheDocument();
    expect(screen.getByText(/regular reminders/i)).toBeInTheDocument();
  });

  test("ensures navigation works if included", () => {
    render(
      <Router initialEntries={["/about"]}>
        <AboutUs />
      </Router>
    );

    expect(screen.getByText(/about full stack flush/i)).toBeInTheDocument();
  });
});
