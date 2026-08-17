const express = require("express");
const Roadmap = require("../models/Roadmap");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new personalized roadmap
router.post("/", protect, async (req, res) => {
    try {
        const {
            topic,
            preferredLanguage,
            learningLevel,
            duration
        } = req.body;

        // Validation
        if (
            !topic ||
            !preferredLanguage ||
            !learningLevel ||
            !duration
        ) {
            return res.status(400).json({
                message:
                    "Please provide topic, preferred language, learning level and duration"
            });
        }

        // Ask Ollama AI to generate the roadmap
        const prompt = `
Create a ${duration}-day personalized learning roadmap for the topic "${topic}".

Learning level: ${learningLevel}
Preferred language: ${preferredLanguage}

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside the JSON.

Use exactly this format:

[
  {
    "day": 1,
    "topic": "Topic name",
    "description": "Short description",
    "completed": false
  }
]

Generate exactly ${duration} days.
Every day must contain:
- day
- topic
- description
- completed

Set completed to false for every day.
`;

        const aiResponse = await fetch(
            "http://localhost:11434/api/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3.2:3b",
                    prompt: prompt,
                    stream: false
                })
            }
        );

        if (!aiResponse.ok) {
            throw new Error("Ollama AI request failed");
        }

        const aiData = await aiResponse.json();

        let generatedRoadmap;

        try {
            generatedRoadmap = JSON.parse(aiData.response);
        } catch (parseError) {
            console.error("AI JSON Parse Error:", aiData.response);

            return res.status(500).json({
                message: "AI generated an invalid roadmap format"
            });
        }

        // Validate roadmap
        if (
            !Array.isArray(generatedRoadmap) ||
            generatedRoadmap.length === 0
        ) {
            return res.status(500).json({
                message: "AI failed to generate a valid roadmap"
            });
        }

        // Make sure every item has completed field
        generatedRoadmap = generatedRoadmap.map((item, index) => ({
            day: Number(item.day) || index + 1,
            topic: item.topic || `Day ${index + 1}`,
            description: item.description || "",
            completed: false
        }));

        // Save roadmap to MongoDB
        const newRoadmap = await Roadmap.create({
            user: req.user._id,
            topic,
            preferredLanguage,
            learningLevel,
            duration,
            roadmap: generatedRoadmap
        });

        res.status(201).json({
            message: "Personalized roadmap created successfully",
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