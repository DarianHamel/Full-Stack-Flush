const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server"); 
const Tutorials = require("../Models/TutorialModel");

let mongoServer;

jest.setTimeout(80000); 

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Tutorials.deleteMany(); // Clear collection before each test
});

describe("GET /api/tutorials", () => {
    it("should return all tutorials", async () => {
        // Insert mock tutorials with all required fields
        const tutorial1 = await Tutorials.create({ 
            title: "Tutorial 1", 
            content: "Content 1", 
            video_url: "https://example.com/video1", 
            difficulty: "Beginner" 
        });
        const tutorial2 = await Tutorials.create({ 
            title: "Tutorial 2", 
            content: "Content 2", 
            video_url: "https://example.com/video2", 
            difficulty: "Intermediate" 
        });

        const res = await request(app).get("/api/tutorials");
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.tutorials).toHaveLength(2);
        expect(res.body.tutorials[0]._id).toBe(tutorial1._id.toString());
        expect(res.body.tutorials[1]._id).toBe(tutorial2._id.toString());
    });

    it("should return a single tutorial when given an ID", async () => {
        const tutorial = await Tutorials.create({ 
            title: "Tutorial 3", 
            content: "Content 3", 
            video_url: "https://example.com/video3", 
            difficulty: "Advanced" 
        });

        const res = await request(app).get(`/api/tutorials?id=${tutorial._id}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.tutorials._id).toBe(tutorial._id.toString());
    });

    it("should return 404 when tutorial ID is not found", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        
        const res = await request(app).get(`/api/tutorials?id=${nonExistentId}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Tutorial not found");
    });

    it("should return 500 on server error", async () => {
        jest.spyOn(Tutorials, "find").mockRejectedValueOnce(new Error("Database error"));

        const res = await request(app).get("/api/tutorials");

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Server error");
    });
});