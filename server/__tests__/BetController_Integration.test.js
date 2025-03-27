const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../Models/UserModel');

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const expressWs = require('express-ws')(app);
const betRoutes = require('../routes/BetRoute');

// Apply middleware and routes
app.use(express.json());
app.use(cookieParser());
app.use("/", betRoutes);

jest.setTimeout(60000);

describe('POST /Bet', () => {
  let mongoServer;
  let testServer;

  beforeAll(async () => {
    // Create in-memory MongoDB server for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Create a test user with all required fields before each test
    await User.create({
      username: 'testuser',
      password: 'ValidPassword123!', // Include required password
      email: 'test@example.com', // Include if required
      balance: 1000,
      moneySpent: 200,
      dailyMoneySpent: 50,
      numLogins: 6
    });

    // Starting the Express server for testing
    return new Promise((resolve) => {
      testServer = app.listen(0, resolve);
    });
  });

  afterEach(async () => {
    // Clean up the test user and close server after each test
    await User.deleteMany({});
    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
    }
  });

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const makeRequest = () => {
    const serverAddress = testServer.address();
    return request(`http://localhost:${serverAddress.port}`);
  };

  it('should successfully process a valid bet', async () => {
    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'testuser', money: 100 });
    
    expect(response.status).toBe(200);
    expect(response.body.money).toBe(900);
    expect(response.body.message).toBe("You're spending more than your average daily amount");
    
    const updatedUser = await User.findOne({ username: 'testuser' });
    expect(updatedUser.balance).toBe(900);
  });

  it('should return 404 for non-existent user', async () => {
    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'nonexistent', money: 100 });
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 400 for insufficient balance', async () => {
    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'testuser', money: 1500 });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient balance');
    
    const user = await User.findOne({ username: 'testuser' });
    expect(user.balance).toBe(1000);
  });

  it('should handle invalid money values', async () => {
    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'testuser', money: 'invalid' });
    
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Bet amount must be a number");
  });

  it('should not show spending message for users with <= 5 logins', async () => {
    // Create a user with few logins
    await User.create({
      username: 'newuser',
      password: 'ValidPassword123!',
      email: 'new@example.com',
      balance: 500,
      moneySpent: 100,
      dailyMoneySpent: 20,
      numLogins: 3
    });

    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'newuser', money: 50 });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('');
  });

  it('should show spending message when spending is above average', async () => {
    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'testuser', money: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("You're spending more than your average daily amount");
  });

  it('should not show spending message when spending is below average', async () => {
    await User.updateOne({ username: 'testuser' }, { dailyMoneySpent: 10 });
    
    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'testuser', money: 5 });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('');
  });

  it('should handle server errors gracefully', async () => {
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'testuser', money: 100 });
    
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });

  it('should handle missing required fields', async () => {
    const tests = [
      { money: 100 }, // missing username
      { username: 'testuser' }, // missing money
      {} // missing both
    ];

    for (const test of tests) {
      const response = await makeRequest()
        .post('/Bet')
        .send(test);
        expect([400, 404, 500]).toContain(response.status);
    }
  });

  it('should handle negative money values', async () => {
    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'testuser', money: -100 });
    
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Bet amount must be positive");
  });

  it('should handle decimal money values', async () => {
    const response = await makeRequest()
      .post('/Bet')
      .send({ username: 'testuser', money: 50.25 });
    
    expect(response.status).toBe(200);
    const updatedUser = await User.findOne({ username: 'testuser' });
    expect(updatedUser.balance).toBeCloseTo(949.75);
  });
});