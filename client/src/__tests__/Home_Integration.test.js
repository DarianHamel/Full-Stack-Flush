import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../components/Home";
import Blackjack from "../components/Blackjack";
import Poker from "../components/Poker";
import Leaderboard from "../components/Leaderboard";
import Login from "../components/Login";
import Signup from "../components/Signup";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import AboutUs from "../components/AboutUs";
import Profile from "../components/Profile";
import Resources from "../components/Resources";
import TutorialPage from "../components/TutorialPage";

// Mock Axios
jest.mock("axios");

describe("Home Component - Integration Tests", () => {
  const mockUsername = "testUser";
  const renderWithRouter = (initialRoute = "/") => {
    return render(
      <Router initialEntries = {[initialRoute]}>
        <Routes>
          <Route path = "/" element = {<Home />} />
          <Route path = "/profile" element = {<Home />} />
          <Route path = "/about-us" element = {<AboutUs />} />
          <Route path = "/resources" element = {<Resources />} />
          <Route path = "/tutorials" element = {<TutorialPage />} />
          <Route path = "/blackjack" element = {<Blackjack />} />
          <Route path = "/poker" element = {<Poker username={mockUsername} />} />
          <Route path = "/leaderboard" element = {<Leaderboard />} />
          <Route path = "/profile" element = {<Profile />} />
        </Routes>
        <ToastContainer />
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
      expect(screen.getByRole('button'));
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

    fireEvent.click(screen.getByText(/poker/i));

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

  /*
  test("fetches user data from API on mount", async () => {
    axios.get.mockImplementation((url) => {
        if (url === "http://localhost:5050/profile") {
          return Promise.resolve({ data: { username: "testuser" } });
        } else if (url === "http://localhost:5050/api/tutorials") {
          return Promise.resolve({ data: [] }); // Mock response for tutorials
        } else if (url === "http://localhost:5050/leaderboard?sortBy=wins&order=desc&filter=") {
          return Promise.resolve({ data: [] }); // Mock response for leaderboard
        }
        return Promise.reject(new Error("Unexpected API call"));
      });      
  
    renderWithRouter();
  
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("http://localhost:5050/profile");
      expect(screen.getByText("@testuser")).toBeInTheDocument();
    });
  });
  */
});
