const express = require("express");
const Roadmap = require("../models/Roadmap");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new roadmap
router.post("/", protect, async (req, res) => {
    try {
        const {
            topic,
            preferredLanguage,
            learningLevel,
            duration,
            roadmap
        } = req.body;

        // Validation
        if (
            !topic ||
            !preferredLanguage ||
            !learningLevel ||
            !duration
        ) {
            return res.status(400).json({
                message: "Please provide topic, preferred language, learning level and duration"
            });
        }

        const newRoadmap = await Roadmap.create({
            user: req.user._id,
            topic,
            preferredLanguage,
            learningLevel,
            duration,
            roadmap: roadmap || []
        });

        res.status(201).json({
            message: "Roadmap created successfully",
            roadmap: newRoadmap
        });

    } catch (error) {
        console.error("Roadmap Create Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// Get all roadmaps of logged-in user
router.get("/", protect, async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Roadmaps fetched successfully",
            roadmaps
        });

    } catch (error) {
        console.error("Roadmap Fetch Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


module.exports = router;