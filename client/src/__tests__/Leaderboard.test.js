import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';

describe('Leaderboard Component', () => {
  test('renders Leaderboard component', () => {
    render(
      <Router>
        <Leaderboard />
      </Router>
    );

    // Add assertions to verify the rendered output
    expect(screen.getByText('Wins')).toBeInTheDocument();
  });
});