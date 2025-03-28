import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TutorialPage from '../components/TutorialPage';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';


jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, onClick }) => (
    <a 
      href={to} 
      onClick={(e) => {
        e.preventDefault(); 
        onClick?.(); 
      }}
    >
      {children}
    </a>
  ),
  useNavigate: () => jest.fn(), 
}));

describe('TutorialPage Component', () => {
  const mockUsername = 'testUser';
  const mockTutorials = [
    {
      _id: '1',
      title: 'Poker',
      content: 'Poker Basics',
      difficulty: 'Beginner',
      video_url: 'http://example.com/poker'
    },
    {
      _id: '2',
      title: 'Blackjack',
      content: 'Blackjack Basics',
      difficulty: 'Beginner',
      video_url: 'http://example.com/blackjack'
    }
  ];

  let user;

  beforeEach(() => {
    
    user = userEvent.setup();
    
    
    jest.clearAllMocks();
    
    
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/tutorials')) {
        return Promise.resolve({ data: { tutorials: mockTutorials } });
      }
      if (url.includes('/api/user-tutorials')) {
        return Promise.resolve({ data: { tutorialsViewed: [] } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    axios.post.mockResolvedValue({});
  });

  it('renders the component with heading and tutorial links', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <TutorialPage username={mockUsername} />
        </MemoryRouter>
      );
    });

    
    expect(screen.getByText('Game Tutorials')).toBeInTheDocument();

    
    await waitFor(() => {
      expect(screen.getByText('Poker')).toBeInTheDocument();
      expect(screen.getByText('Blackjack')).toBeInTheDocument();
    });
  });

  it('loads and displays tutorials from the API', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <TutorialPage username={mockUsername} />
        </MemoryRouter>
      );
    });

    
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5050/api/tutorials');
    expect(axios.get).toHaveBeenCalledWith(`http://localhost:5050/api/user-tutorials/${mockUsername}`);

    
    await waitFor(() => {
      mockTutorials.forEach(tutorial => {
        expect(screen.getByText(tutorial.title)).toBeInTheDocument();
      });
    });
  });

  it('marks tutorial as viewed when clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <TutorialPage username={mockUsername} />
        </MemoryRouter>
      );
    });

    
    await waitFor(() => {
      expect(screen.getByText('Poker')).toBeInTheDocument();
    });

    
    await act(async () => {
      await user.click(screen.getByText('Poker'));
    });

    
    expect(axios.post).toHaveBeenCalledWith(
      `http://localhost:5050/api/user-tutorials/${mockUsername}`,
      { tutorialId: '1' }
    );
  });

  it('shows checkmark for viewed tutorials', async () => {
    
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/tutorials')) {
        return Promise.resolve({ data: { tutorials: mockTutorials } });
      }
      if (url.includes('/api/user-tutorials')) {
        return Promise.resolve({ 
          data: { 
            tutorialsViewed: [{ _id: '1' }] 
          } 
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <TutorialPage username={mockUsername} />
        </MemoryRouter>
      );
    });

    
    await waitFor(() => {
      expect(screen.getByText('Poker').closest('div')).toHaveTextContent('✔');
      expect(screen.getByText('Blackjack').closest('div')).not.toHaveTextContent('✔');
    });
  });

  it('handles API errors gracefully', async () => {
    
    axios.get.mockRejectedValue(new Error('API Error'));

    
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(
        <MemoryRouter>
          <TutorialPage username={mockUsername} />
        </MemoryRouter>
      );
    });

    
    expect(consoleError).toHaveBeenCalledWith('Error fetching tutorials:', expect.any(Error));

    
    consoleError.mockRestore();
  });

  it('matches snapshot', async () => {
    let container;
    await act(async () => {
      container = render(
        <MemoryRouter>
          <TutorialPage username={mockUsername} />
        </MemoryRouter>
      ).container;
    });

    
    await waitFor(() => {
      expect(screen.getByText('Poker')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});