const express = require("express");
const { getDB } = require("../db/connection.js");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const { game, title, content, difficulty, video_url, createdAt } = req.body;

    if (!game || !title || !content || !difficulty || !video_url || !createdAt) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const tutorial = { game, title, content, difficulty, video_url, createdAt: new Date(createdAt) };
    const result = await db.collection("tutorials").insertOne(tutorial);

    res.status(201).json({ success: true, message: "Tutorial created successfully", tutorial: result });
  } catch (error) {
    console.error("❌ Error saving tutorial:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const tutorials = await db.collection("tutorials").find({}).toArray();
    res.status(200).json({ success: true, tutorials });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const tutorial = await db.collection("tutorials").findOne({ _id: new ObjectId(req.params.id) });

    if (!tutorial) return res.status(404).json({ success: false, message: "Tutorial not found" });

    res.status(200).json({ success: true, tutorial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("tutorials").deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Tutorial not found" });

    res.status(200).json({ success: true, message: "Tutorial deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;
