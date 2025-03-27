import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../components/Home";
import Blackjack from "../components/Blackjack";
import Poker from "../components/Poker";
import Leaderboard from "../components/Leaderboard";
import AboutUs from "../components/AboutUs";
import Resources from "../components/Resources";
import TutorialPage from "../components/TutorialPage";
import Profile from "../components/Profile";

// Mock Axios
jest.mock("axios");

describe("Home Component - Integration Tests", () => {
  const mockUsername = "testUser";

  const renderWithRouter = (initialRoute = "/") => {
    return render(
      <Router initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<Home username={mockUsername} setUsername={jest.fn()} />} />
          <Route path="/profile" element={<Profile username={mockUsername} />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/tutorials" element={<TutorialPage username={mockUsername} />} />
          <Route path="/blackjack" element={<Blackjack username={mockUsername} />} />
          <Route path="/poker" element={<Poker username={mockUsername} />} />
          <Route path="/leaderboard" element={<Leaderboard username={mockUsername} />} />
        </Routes>
      </Router>
    );
  };

  test("renders Home component with navigation links", () => {
    renderWithRouter();
    
    expect(screen.getByText(/blackjack/i)).toBeInTheDocument();
    expect(screen.getByText(/about us/i)).toBeInTheDocument();
    expect(screen.getByText(/resources/i)).toBeInTheDocument();
    expect(screen.getByText(/tutorials/i)).toBeInTheDocument();
    expect(screen.getByText(/poker/i)).toBeInTheDocument();
    expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
  });

  test("navigates to Blackjack when the link is clicked", async () => {
    renderWithRouter();

    fireEvent.click(screen.getByText(/blackjack/i));

    await waitFor(() => {
      expect(screen.getByText("♠️ Blackjack ♥️")).toBeInTheDocument();
    });
  });

  test("navigates to About-Us when the link is clicked", async () => {
    renderWithRouter();

    fireEvent.click(screen.getByText(/about us/i));

    await waitFor(() => {
      expect(screen.getByText("About Full Stack Flush")).toBeInTheDocument();
    });
  });

  test("navigates to Resources when the link is clicked", async () => {
    renderWithRouter();

    fireEvent.click(screen.getByText(/resources/i));

    await waitFor(() => {
      expect(screen.getByText("Gambling Resources")).toBeInTheDocument();
    });
  });

  test("navigates to Tutorials when the link is clicked", async () => {
    renderWithRouter();

    fireEvent.click(screen.getByText(/tutorials/i));

    await waitFor(() => {
      expect(screen.getByText("Game Tutorials")).toBeInTheDocument();
    });
  });

  test("navigates to Poker when the link is clicked", async () => {
    renderWithRouter();

    fireEvent.click(screen.getByText(/Poker/i));

    await waitFor(() => {
      expect(screen.getByText(/♠️ Poker Minigame ♥️/i)).toBeInTheDocument();
    });
  });

  test("navigates to Leaderboard when the link is clicked", async () => {
    renderWithRouter();

    fireEvent.click(screen.getByText(/leaderboard/i));

    await waitFor(() => {
      expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
    });
  });
});
