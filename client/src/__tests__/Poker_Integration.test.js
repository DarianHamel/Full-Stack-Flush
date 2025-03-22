import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Poker from '../components/Poker';
import { BrowserRouter as Router } from 'react-router-dom';

jest.setTimeout(80000); 

// Mocking the fetch requests
global.fetch = jest.fn();

describe('Poker Component', () => {
  const username = 'testUser';

  beforeEach(() => {
    // Reset the mock before each test
    fetch.mockClear();
  });

  it('should render poker game UI elements', () => {
    render(
      <Router>
        <Poker username={username} />
      </Router>
    );

    expect(screen.getByText('♠️ Poker Minigame ♥️')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the Poker Minigame!')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Difficulty:')).toBeInTheDocument();
    expect(screen.getByLabelText('Place Your Bet:')).toBeInTheDocument();
  });

  it('should update difficulty when changed', () => {
    render(
      <Router>
        <Poker username={username} />
      </Router>
    );

    const difficultySelect = screen.getByLabelText('Select Difficulty:');
    fireEvent.change(difficultySelect, { target: { value: 'medium' } });

    expect(difficultySelect.value).toBe('medium');
  });

  it('should alert when bet amount is invalid', async () => {
    render(
      <Router>
        <Poker username={username} />
      </Router>
    );

    // Set a bet amount of 0
    const betInput = screen.getByLabelText('Place Your Bet:');
    fireEvent.change(betInput, { target: { value: '0' } });

    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // Wait for the alert and check its message
    await waitFor(() => {
      expect(screen.getByText('Please place a valid bet!')).toBeInTheDocument();
    });
  });

  it('should start the game and make a bet', async () => {
    fetch.mockResolvedValueOnce({
      json: () => ({
        gameID: '123',
        playerHand: [{ rank: 'A', suit: 'Hearts' }, { rank: 'K', suit: 'Spades' }],
        handsRemaining: 5,
        discardsRemaining: 3,
        targetScore: 100
      })
    });
    
    fetch.mockResolvedValueOnce({
      json: () => ({ balance: 100 })
    });

    render(
      <Router>
        <Poker username={username} />
      </Router>
    );

    const betInput = screen.getByLabelText('Place Your Bet:');
    fireEvent.change(betInput, { target: { value: '10' } });

    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // Check if game starts and game elements are rendered
    await waitFor(() => {
      expect(screen.getByText('Your hand:')).toBeInTheDocument();
    });
  });

  it('should discard selected cards', async () => {
    fetch.mockResolvedValueOnce({
      json: () => ({
        newCards: [{ rank: 'Q', suit: 'Diamonds' }, { rank: 'J', suit: 'Clubs' }]
      })
    });

    render(
      <Router>
        <Poker username={username} />
      </Router>
    );

    // Start the game first
    const betInput = screen.getByLabelText('Place Your Bet:');
    fireEvent.change(betInput, { target: { value: '10' } });

    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // Select cards to discard
    const card = screen.getByText('A♠'); // Assuming the card has this text, adapt if needed
    fireEvent.click(card);

    const discardButton = screen.getByText('Discard Cards');
    fireEvent.click(discardButton);

    await waitFor(() => {
      expect(screen.getByText('Q♦')).toBeInTheDocument();
      expect(screen.getByText('J♣')).toBeInTheDocument();
    });
  });

  it('should handle game over and show score', async () => {
    fetch.mockResolvedValueOnce({
      json: () => ({
        score: 50,
        handsRemaining: 0,
        currentScore: 100
      })
    });

    render(
      <Router>
        <Poker username={username} />
      </Router>
    );

    const playButton = screen.getByText('Play Hand');
    fireEvent.click(playButton);

    // Wait for score alert and check its content
    await waitFor(() => {
      expect(screen.getByText('Your hand scored: 50')).toBeInTheDocument();
    });
  });
});

