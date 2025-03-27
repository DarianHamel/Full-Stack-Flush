import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthRedirect from '../components/AuthRedirect';
import Home from '../components/Home'
import Blackjack from '../components/Blackjack'

// Mock the toast function
jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
  },
}));

describe('AuthRedirect Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when username is provided', () => {
    render(
      <MemoryRouter>
        <AuthRedirect username="testuser">
          <div>Protected Content</div>
        </AuthRedirect>
      </MemoryRouter>
    );

    // Check that the protected content is displayed
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to home page and shows toast message when username is not provided', async () => {
    render(
      <MemoryRouter initialEntries={['/blackjack']}>
        <Routes>
          <Route
            path="/blackjack"
            element={
              <Blackjack />
            }
          />
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    );

    // Check that the toast message is displayed
    expect(toast.info).toHaveBeenCalledWith(
      "You are not signed in. Redirecting to home page...",
      {
        position: "top-center",
        autoClose: 3000,
      }
    );

    // Wait for the redirection to home page
    await waitFor(() => {
      expect(screen.getByText('Blackjack')).toBeInTheDocument();
      expect(screen.getByText('Poker')).toBeInTheDocument();
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
      expect(screen.getByText('Tutorials')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByText('About Us')).toBeInTheDocument();
    } ,{timeout:3100});
  });

  test('does not render children when username is not provided', () => {
    render(
      <MemoryRouter>
        <AuthRedirect username="">
          <div>Protected Content</div>
        </AuthRedirect>
      </MemoryRouter>
    );

    // Check that the protected content is not displayed
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});