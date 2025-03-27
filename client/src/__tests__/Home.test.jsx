import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../components/Home';

describe('Home Component - Unit Tests', () => {
  test('renders Home component', () => {
    render(
      <Router>
        <Home username="testUser" setUsername={jest.fn()} />
      </Router>
    );

    expect(screen.getByText('Blackjack')).toBeInTheDocument();
    expect(screen.getByText('Poker')).toBeInTheDocument();
    expect(screen.getByText('Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  test("each navigation link has the correct href attribute", () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    expect(screen.getByText("Blackjack").closest("a")).toHaveAttribute("href", "/blackjack");
    expect(screen.getByText("Poker").closest("a")).toHaveAttribute("href", "/poker");
    expect(screen.getByText("Tutorials").closest("a")).toHaveAttribute("href", "/tutorials");
    expect(screen.getByText("Leaderboard").closest("a")).toHaveAttribute("href", "/leaderboard");
    expect(screen.getByText("Resources").closest("a")).toHaveAttribute("href", "/resources");
    expect(screen.getByText("About Us").closest("a")).toHaveAttribute("href", "/about-us");
  });

  test("each card-wrapper has the correct class", () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    const cardWrappers = screen.getAllByRole("link");
    cardWrappers.forEach((card) => {
      expect(card).toHaveClass("card");
    });
  });
});