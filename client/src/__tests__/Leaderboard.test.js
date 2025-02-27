import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';


describe('Leaderboard Component', () => {
  test('renders sorting dropdown options', () => {
    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    // Add assertions to verify the rendered output
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('Losses')).toBeInTheDocument();
    expect(screen.getByText('Win/Loss Ratio')).toBeInTheDocument();
    expect(screen.getByText('Money Spent')).toBeInTheDocument();
    expect(screen.getByText('Time Spent')).toBeInTheDocument();
  });

  test('displays "No data available" when leaderboard is empty', () => {
    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});