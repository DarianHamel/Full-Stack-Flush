const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { handleBet } = require('../util/HandleBet');

describe('handleBet - Unit Tests', () => {
  let mockAxios;

  beforeAll(() => {
    // mock adapter
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    // Reset the mock adapter\
    mockAxios.reset();
  });

  afterAll(() => {
    // Restore the original axios adapter 
    mockAxios.restore();
  });

  test('should make POST request with correct parameters', async () => {
    const username = 'testuser';
    const bet = 100;
    const mockResponse = { money: 900, message: 'Bet placed successfully' };
    
    mockAxios.onPost('http://localhost:5050/Bet').reply(200, mockResponse);

    const result = await handleBet(username, bet);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBe(JSON.stringify({
      username: username,
      money: bet
    }));
    expect(mockAxios.history.post[0].withCredentials).toBe(true);
    expect(result).toBe(mockResponse.message);
  });

  test('should return undefined when no username provided', async () => {
    const result = await handleBet(null, 100);
    expect(result).toBeUndefined();
  });

  test('should handle API errors gracefully', async () => {
    const username = 'testuser';
    const bet = 100;
    
    mockAxios.onPost('http://localhost:5050/Bet').reply(500);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = await handleBet(username, bet);

    expect(consoleSpy).toHaveBeenCalledWith('Error updating losses: ', expect.any(Error));
    expect(result).toBeUndefined();
    
    consoleSpy.mockRestore();
  });

  test('should log money from successful response', async () => {
    const username = 'testuser';
    const bet = 100;
    const mockResponse = { money: 900, message: 'Bet placed successfully' };
    
    mockAxios.onPost('http://localhost:5050/Bet').reply(200, mockResponse);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await handleBet(username, bet);

    expect(consoleSpy).toHaveBeenCalledWith('Money: ', mockResponse.money);
    
    consoleSpy.mockRestore();
  });
});