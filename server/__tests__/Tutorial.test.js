const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Tutorial = require("../Models/TutorialModel");
const { GetTutorials } = require("../Controllers/TutorialController");

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
  await Tutorial.deleteMany(); 
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ========================================================================

describe("GetTutorials API Tests", () => {

    // 1 -- Retrieve tutorial by ID (success)

    test("GetTutorials returns a tutorial based on ID requested", async () => {
        const exampleTut = await Tutorial.create({
            title: "Intro to Blackjack",
            content: "Blackjack Basics",
            difficulty: "Beginner",
            video_url: "http://FullStackFlush/blackjackVid"
        });

        const req = { query: { id: exampleTut._id.toString() } };
        const res = mockResponse();

        await GetTutorials(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, tutorials: expect.any(Object) }); // too much requirements for tutorial return

    });

    // 2 -- Tutorial not found when invalid ID is provided

    test("GetTutorials returns a 404 if an invalid ID tutorial is given", async () => {
        const req = { query: { id: new mongoose.Types.ObjectId().toString() } };
        const res = mockResponse();

        await GetTutorials(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Tutorial not found" }); // too much requirements for tutorial return
    });

    // 3 -- Missing id parameter + return all tutorials

    test("GetTutorials returns all the tutorials if an id is not included", async () => {
        const exampleTut = await Tutorial.create([
            { title: "Intro to Blackjack", content: "Blackjack Basics", difficulty: "Beginner", video_url: "http://FullStackFlush/blackjackVid"},
            { title: "Intro to Poker", content: "Poker Basics", difficulty: "Beginner", video_url: "http://FullStackFlush/pokerVid"},  
        ]);

        const req = { query: {} };
        const res = mockResponse();

        await GetTutorials(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, tutorials : expect.any(Array) });
    });

    // 4 -- Server error while retrieving tutorials

    test("GetTutorials returns a server error when there's an invalid id for retrieving tutorials", async () => {
        const req = { query: { id: "full-stack-flush"} };
        const res = mockResponse();

        await GetTutorials(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server error" });
    });

    // 7 -- Invalid query with bad id type

    test("GetTutorials returns a server error when there's an invalid id for retrieving tutorials", async () => {
        const req = { query: { id: 111 } };
        const res = mockResponse();

        await GetTutorials(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server error" });
    });

    // 8 -- Empty list of tutorials find()

    test("GetTutorials returns server error if User.find() fails", async () => {
        jest.spyOn(Tutorial, "find").mockRejectedValue(new Error("Database error"));
    
        const req = { query: { } };
        const res = mockResponse();
    
        await GetTutorials(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server error" });
    
        Tutorial.find.mockRestore();
      });
});