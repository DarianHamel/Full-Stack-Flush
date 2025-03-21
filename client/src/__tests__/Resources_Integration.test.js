import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Resources from "../components/Resources";

describe("Resources Component Integration Tests", () => {
  test("renders all sections correctly", () => {
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    expect(screen.getByText("Gambling Resources")).toBeInTheDocument();
    expect(screen.getByText("Before You Play")).toBeInTheDocument();
    expect(screen.getByText("Responsible Gambling Tips")).toBeInTheDocument();
    expect(screen.getByText("Help and Support")).toBeInTheDocument();
  });

  test("renders all external resource links correctly", () => {
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    const responsibleGamblingLink = screen.getByText("Responsible Gambling Council");
    expect(responsibleGamblingLink).toBeInTheDocument();
    expect(responsibleGamblingLink).toHaveAttribute("href", "https://www.responsiblegambling.org");

    const manitobaGamblingLink = screen.getByText("Manitoba Gambling Addiction");
    expect(manitobaGamblingLink).toBeInTheDocument();
    expect(manitobaGamblingLink).toHaveAttribute("href", "https://afm.mb.ca/programs-and-services/gambling/");

    const camhLink = screen.getByText("CAMH Problem Gambling");
    expect(camhLink).toBeInTheDocument();
    expect(camhLink).toHaveAttribute("href", "https://www.camh.ca/en/health-info/mental-illness-and-addiction-index/problem-gambling");
  });

  test("navigates back to home when clicking 'Back to Home'", async () => {
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    const backButton = screen.getByText("Back to Home");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute("href", "/");
  });
});