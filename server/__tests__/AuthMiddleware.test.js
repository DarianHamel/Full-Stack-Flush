const { userVerification } = require('../Middleware/AuthMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');

jest.setTimeout(60000);

// Mock User model and jwt
jest.mock('../Models/UserModel');
jest.mock('jsonwebtoken');

describe('AuthMiddleware - userVerification', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
        cookies: {} 
    };

    res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    process.env.SECRET = 'test-secret';
  });

  test('should return false when no token is provided', async () => {
    req.cookies.token = undefined;

    await userVerification(req, res);

    expect(res.json).toHaveBeenCalledWith({
      status: false,
      message: "No token provided"
    });
  });

  test('should return false for invalid token', async () => {
    req.cookies.token = 'invalid-token';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), undefined);
    });

    await userVerification(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      'invalid-token',
      'test-secret',
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({ status: false });
  });

  test('should return true with username for valid token and existing user', async () => {
    req.cookies.token = 'valid-token';
    const mockUser = { username: 'testuser' };
    
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { id: 'user123' });
    });
    User.findById.mockResolvedValue(mockUser);

    await userVerification(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      user: 'testuser'
    });
  });

  test('should return false when user not found', async () => {
    req.cookies.token = 'valid-token';
    
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { id: 'user123' });
    });
    User.findById.mockResolvedValue(null);

    await userVerification(req, res);

    expect(res.json).toHaveBeenCalledWith({ status: false });
  });

  test('should handle database errors', async () => {
    req.cookies.token = 'valid-token';
    
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { id: 'user123' });
    });
    User.findById.mockRejectedValue(new Error('DB error'));

    await userVerification(req, res);

    expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: "Database error"
    });
  });

  test('should handle server errors', async () => {
    req.cookies.token = 'valid-token';
    
    // Mock jwt.verify to throw an error in the outer try-catch
    jwt.verify.mockImplementation(() => {
      throw new Error('Unexpected error');
    });
  
    await userVerification(req, res);
  
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      message: "Server error"
    });
  });
});