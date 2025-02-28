const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../Models/UserModel");
const { Signup, Login } = require("../Controllers/AuthController");

jest.mock('../util/SecretToken', () => ({
    createSecretToken: jest.fn(() => 'test_token')
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany(); 
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

// ========================================================================

// Not gonna be with UserModel!!!

describe("GetTutorials API Tests", () => {
    
    // 1 -- Retrieve tutorial by ID (success)

    // 2 -- Tutorial not found when invalid ID is provided

    // 3 -- Retrieve all tutorials

    // 4 -- Server error while retrieving tutorials

    // 5 -- Missing id parameter

    // 6 -- Validate correct resonse when tutorial is found

    // 7 -- Invalid query with bad id type

    // 8 -- Empty list of tutorials find()

});