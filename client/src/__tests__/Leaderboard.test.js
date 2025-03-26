import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';

describe('Leaderboard Component - Unit Tests', () => {
  test('renders sorting dropdown options', () => {
    render(
      <Router>
        <Leaderboard />
      </Router>
    );

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

  test('updates sort selection correctly', () => {
    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    const sortDropdown = screen.getByLabelText(/sort/i);
    fireEvent.change(sortDropdown, { target: { value: 'moneySpent' } });

    expect(sortDropdown.value).toBe('moneySpent');
  });

  test('updates filter selection correctly', () => {
    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    const filterDropdown = screen.getByLabelText(/filter/i);
    fireEvent.change(filterDropdown, { target: { value: 'highSpenders' } });

    expect(filterDropdown.value).toBe('highSpenders');
  });

  test('updates order selection correctly', () => {
    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    const orderDropdown = screen.getByLabelText(/order/i);
    fireEvent.change(orderDropdown, { target: { value: 'desc' } });

    expect(orderDropdown.value).toBe('desc');
  });
});
