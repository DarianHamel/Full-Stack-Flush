const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../Models/UserModel');

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const expressWs = require('express-ws')(app);
const profileRoutes = require('../routes/ProfileRoute'); 

// middleware and routes
app.use(express.json());
app.use(cookieParser());
app.use("/", profileRoutes);

jest.setTimeout(60000);

describe('Profile Controller Integration Tests', () => {
  let mongoServer;
  let testServer;
  let testUser;

  beforeAll(async () => {
    // in-memory MongoDB server for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // test user with all required fields before each test
    testUser = await User.create({
      username: 'testuser',
      password: 'ValidPassword123!',
      email: 'test@example.com',
      balance: 1000,
      moneyLimit: 500,
      timeLimit: 120,
      timeSpent: 0,
      dailyTimeSpent: 0,
      moneySpent: 0,
      dailyMoneySpent: 0,
      wins: 5,
      losses: 3,
      lastLogin: new Date(),
      numLogins: 1
    });

    // Express server for testing
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

  describe('GET /userInfo', () => {
    it('should return user details with password', async () => {
      const res = await makeRequest()
        .get('/userInfo')
        .query({ username: 'testuser' });
      
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('testuser');
      expect(res.body.password).toBeDefined(); 
      expect(res.body.timeLimit).toBe(120);
      expect(res.body.moneyLimit).toBe(500);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await makeRequest()
        .get('/userInfo')
        .query({ username: 'nonexistent' });
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('GET /getBalance', () => {
    it('should return user balance', async () => {
      const res = await makeRequest()
        .get('/getBalance')
        .query({ username: 'testuser' });
      
      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(1000);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await makeRequest()
        .get('/getBalance')
        .query({ username: 'nonexistent' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('POST /setTimeSpent', () => {
    it('should update time spent', async () => {
      const res = await makeRequest()
        .post('/setTimeSpent')
        .send({ username: 'testuser', timeSpent: 60 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.timeSpent).toBe(60);

      const updatedUser = await User.findOne({ username: 'testuser' });
      expect(updatedUser.timeSpent).toBe(60);
    });

    it('should reject negative time values', async () => {
      const res = await makeRequest()
        .post('/setTimeSpent')
        .send({ username: 'testuser', timeSpent: -10 });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle zero time spent', async () => {
      const res = await makeRequest()
        .post('/setTimeSpent')
        .send({ username: 'testuser', timeSpent: 0 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /getLastLogin', () => {
    it('should return last login date', async () => {
      const res = await makeRequest()
        .get('/getLastLogin')
        .query({ username: 'testuser' });
      
      expect(res.status).toBe(200);
      expect(new Date(res.body.lastLogin).getTime()).toBeCloseTo(testUser.lastLogin.getTime(), -3);
    });
  });

  describe('POST /resetDailyLimits', () => {
    it('should reset daily limits', async () => {
      // Setting some spent values first
      await User.updateOne(
        { username: 'testuser' },
        { dailyTimeSpent: 60, dailyMoneySpent: 200 }
      );

      const res = await makeRequest()
        .post('/resetDailyLimits')
        .send({ username: 'testuser' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const updatedUser = await User.findOne({ username: 'testuser' });
      expect(updatedUser.dailyTimeSpent).toBe(0);
      expect(updatedUser.dailyMoneySpent).toBe(0);
    });
  });

  describe('GET /getMoneyLimit', () => {
    it('should return money limit', async () => {
      const res = await makeRequest()
        .get('/getMoneyLimit')
        .query({ username: 'testuser' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.moneyLimit).toBe(500);
    });
  });

  describe('GET /getLimits', () => {
    it('should return all limit information', async () => {
      const res = await makeRequest()
        .get('/getLimits')
        .query({ username: 'testuser' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.moneyLimit).toBe(500);
      expect(res.body.timeLimit).toBe(120);
      expect(res.body.timeSpent).toBe(0);
      expect(res.body.moneySpent).toBe(0);
      expect(res.body.balance).toBe(1000);
    });
  });

  describe('GET /getStats', () => {
    it('should return user statistics', async () => {
      const res = await makeRequest()
        .get('/getStats')
        .query({ username: 'testuser' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.timeSpent).toBe(0);
      expect(res.body.moneySpent).toBe(0);
      expect(res.body.wins).toBe(5);
      expect(res.body.losses).toBe(3);
    });
  });

  describe('POST /setTimeLimit', () => {
    it('should update time limit', async () => {
      const res = await makeRequest()
        .post('/setTimeLimit')
        .send({ username: 'testuser', timeLimit: 180 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const updatedUser = await User.findOne({ username: 'testuser' });
      expect(updatedUser.timeLimit).toBe(180);
    });

    it('should reject invalid time limits', async () => {
      const res = await makeRequest()
        .post('/setTimeLimit')
        .send({ username: 'testuser', timeLimit: -10 });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /setMoneyLimit', () => {
    it('should update money limit', async () => {
      const res = await makeRequest()
        .post('/setMoneyLimit')
        .send({ username: 'testuser', moneyLimit: 1000 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const updatedUser = await User.findOne({ username: 'testuser' });
      expect(updatedUser.moneyLimit).toBe(1000);
    });

    it('should reject invalid money limits', async () => {
      const res = await makeRequest()
        .post('/setMoneyLimit')
        .send({ username: 'testuser', moneyLimit: -50 });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      // Forces a database error
      await mongoose.disconnect();
      
      const res = await makeRequest()
        .get('/userInfo')
        .query({ username: 'testuser' });
      
      expect(res.status).toBe(500);
      
      // Reconnect for remaining tests
      await mongoose.connect(mongoServer.getUri());
    });
  });
});