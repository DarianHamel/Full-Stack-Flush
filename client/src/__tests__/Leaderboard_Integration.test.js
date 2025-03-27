import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import Leaderboard from '../components/Leaderboard';
import '@testing-library/jest-dom';

// Mock axios to control API responses
jest.mock('axios');

describe('Leaderboard Integration Tests', () => {
  const mockLeaderboardData = [
    {
      _id: '1',
      username: 'user1',
      wins: 10,
      losses: 2,
      winLossRatio: 5.0,
      moneySpent: 1500,
      timeSpent: 6000 // 100 hours in minutes
    },
    {
      _id: '2',
      username: 'user2',
      wins: 12,
      losses: 6,
      winLossRatio: 2.0,
      moneySpent: 500,
      timeSpent: 3000 // 50 hours in minutes
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Default mock implementation
    axios.get.mockResolvedValue({ data: mockLeaderboardData });
  });

  test('renders leaderboard with data from API', async () => {
    render(<Leaderboard />);
    
    // Initial loading state might show "No data available" briefly
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5050/leaderboard?sortBy=wins&order=desc&filter='
      );
    });

    // Verify table headers
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getAllByText('Username').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Wins').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Losses').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Win/Loss Ratio').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Money Spent').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Time Spent').length).toBeGreaterThan(0);

    // Verify data is displayed
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1.5K')).toBeInTheDocument(); // formatted money
    expect(screen.getByText('100')).toBeInTheDocument(); // formatted time
  });

  test('displays "No data available" when API returns empty array', async () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    console.error = jest.fn(); // suppress error logs in test output
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalledWith(
      'An error occurred with the Network: ',
      expect.any(Error)
    );
  });

  test('changes sort criteria and refetches data', async () => {
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=wins')
      );
    });

    // Change sort to losses
    fireEvent.change(screen.getByLabelText('Sort'), {
      target: { value: 'losses' }
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=losses')
      );
    });
  });

  test('changes order and refetches data', async () => {
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('order=desc')
      );
    });

    // Change order to ascending
    fireEvent.change(screen.getByLabelText('Order'), {
      target: { value: 'asc' }
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('order=asc')
      );
    });
  });

  test('applies filter and refetches data', async () => {
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('filter=')
      );
    });

    // Apply high spenders filter
    fireEvent.change(screen.getByLabelText('Filter'), {
      target: { value: 'highSpenders' }
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('filter=highSpenders')
      );
    });
  });

  test('formats numbers correctly', async () => {
    render(<Leaderboard />);
    
    await waitFor(() => {
      // Check formatting of money spent (1500 becomes 1.5K)
      expect(screen.getByText('1.5K')).toBeInTheDocument();
      // Check formatting of time spent (6000 minutes becomes 100 hours)
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  test('displays formatted numbers in leaderboard', async () => {
    const testData = [{
      _id: '1',
      username: 'testuser',
      wins: 10,
      losses: 2,
      winLossRatio: 5,
      moneySpent: 1500000, // 1.5M
      timeSpent: 6000 // 100 hours
    }];
    
    axios.get.mockResolvedValue({ data: testData });
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('1.5M')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });
});