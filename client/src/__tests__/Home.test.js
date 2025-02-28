import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../components/Home';

describe('Home Component', () => {
  test('renders Home component with navigation links', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    expect(screen.getByText('Blackjack')).toBeInTheDocument();
    expect(screen.getByText('Poker')).toBeInTheDocument();
    expect(screen.getByText('Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });
});