const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { handleWin, handleLose } = require('../util/HandleWinLoss'); 

describe('WinLoss Handler Unit Tests', () => {
  let mockAxios;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockAxios.restore();
  });

  describe('handleWin', () => {
    test('should make correct POST request for win', async () => {
      const username = 'testUser';
      const bet = 100;
      const game = 'blackjack';
      const mockResponse = { wins: 5, losses: 2 };

      mockAxios.onPost('http://localhost:5050/updateStats').reply(200, mockResponse);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await handleWin(username, bet, game);

      expect(mockAxios.history.post.length).toBe(1);
      const request = mockAxios.history.post[0];
      expect(request.data).toEqual(JSON.stringify({
        username,
        wins: 1,
        losses: 0,
        money: bet,
        game
      }));
      expect(request.withCredentials).toBe(true);
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should not make request when username is missing', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await handleWin(null, 100, 'poker');

      expect(mockAxios.history.post.length).toBe(0);
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle API errors gracefully', async () => {
      const username = 'testUser';
      mockAxios.onPost('http://localhost:5050/updateStats').reply(500);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await handleWin(username, 100, 'roulette');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating wins: ', 
        expect.objectContaining({ isAxiosError: true })
      );

      consoleSpy.mockRestore();
    });

    test('should handle network errors', async () => {
      const username = 'testUser';
      mockAxios.onPost('http://localhost:5050/updateStats').networkError();

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await handleWin(username, 50, 'slots');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating wins: ', 
        expect.objectContaining({ message: 'Network Error' })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('handleLose', () => {
    test('should make correct POST request for loss', async () => {
      const username = 'testUser';
      const bet = 75;
      const game = 'poker';
      const mockResponse = { wins: 3, losses: 4 };

      mockAxios.onPost('http://localhost:5050/updateStats').reply(200, mockResponse);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await handleLose(username, bet, game);

      expect(mockAxios.history.post.length).toBe(1);
      const request = mockAxios.history.post[0];
      expect(request.data).toEqual(JSON.stringify({
        username,
        wins: 0,
        losses: 1,
        money: bet,
        game
      }));
      expect(request.withCredentials).toBe(true);
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should not make request when username is missing', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await handleLose(undefined, 200, 'blackjack');

      expect(mockAxios.history.post.length).toBe(0);
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle API errors gracefully', async () => {
      const username = 'testUser';
      mockAxios.onPost('http://localhost:5050/updateStats').reply(400, { error: 'Bad Request' });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await handleLose(username, 150, 'roulette');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating losses: ', 
        expect.objectContaining({ isAxiosError: true })
      );

      consoleSpy.mockRestore();
    });

    test('should handle request timeouts', async () => {
      const username = 'testUser';
      mockAxios.onPost('http://localhost:5050/updateStats').timeout();

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await handleLose(username, 80, 'slots');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating losses: ', 
        expect.objectContaining({ code: 'ECONNABORTED' })
      );

      consoleSpy.mockRestore();
    });
  });
});