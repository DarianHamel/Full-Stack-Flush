import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

describe('Leaderboard Component - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test('displays formatted numbers correctly for all ranges', async () => {
    const testData = [
      {
        _id: '1',
        username: 'thousand_user',
        wins: 10,
        losses: 2,
        winLossRatio: 5,
        moneySpent: 1500,      // 1.5K
        timeSpent: 6000        // 100 hours
      },
      {
        _id: '2',
        username: 'million_user',
        wins: 20,
        losses: 5,
        winLossRatio: 4,
        moneySpent: 2500000,   // 2.5M
        timeSpent: 12000       // 200 hours
      },
      {
        _id: '3',
        username: 'billion_user',
        wins: 30,
        losses: 3,
        winLossRatio: 10,
        moneySpent: 3500000000, // 3.5B
        timeSpent: 18000        // 300 hours
      }
    ];
  
    axios.get.mockResolvedValueOnce({ data: testData });
  
    render(
      <Router>
        <Leaderboard />
      </Router>
    );
  
    await waitFor(() => {
      // Verify thousand formatting
      expect(screen.getByText('1.5K')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      
      // Verify million formatting
      expect(screen.getByText('2.5M')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      
      // Verify billion formatting
      expect(screen.getByText('3.5B')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
      
      // Verify all usernames appear
      expect(screen.getByText('thousand_user')).toBeInTheDocument();
      expect(screen.getByText('million_user')).toBeInTheDocument();
      expect(screen.getByText('billion_user')).toBeInTheDocument();
    });
  });
});