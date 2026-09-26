const express = require("express");
const Roadmap = require("../models/Roadmap");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// CREATE PERSONALIZED ROADMAP
// ========================================

router.post("/", protect, async (req, res) => {
    try {

        const {
            topic,
            preferredLanguage,
            learningLevel,
            duration
        } = req.body;

        // ========================================
        // VALIDATION
        // ========================================

        if (
            !topic ||
            !preferredLanguage ||
            !learningLevel ||
            !duration
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide topic, preferred language, learning level and duration"
            });
        }

        const numberOfDays = Number(duration);

        if (
            !Number.isInteger(numberOfDays) ||
            numberOfDays < 1 ||
            numberOfDays > 40
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Duration must be between 1 and 40 days"
            });
        }

        // ========================================
        // LANGUAGE INSTRUCTION
        // ========================================

        let languageInstruction = "";

        if (preferredLanguage === "Tamil") {

            languageInstruction = `
The user selected Tamil.

Write all roadmap topics in Tamil.
Write all descriptions in simple Tamil.

Do not write complete English sentences.

Technical terms such as Java, Python, HTML, CSS,
SQL, API, OOP and similar terms may remain in English
when necessary.

Use simple Tamil that a student can easily understand.
`;

        } else if (preferredLanguage === "English") {

            languageInstruction = `
The user selected English.

Write all roadmap topics in English.
Write all descriptions in simple and clear English.

Do not write Tamil.
`;

        } else if (preferredLanguage === "Bilingual") {

            languageInstruction = `
The user selected Bilingual.

Write each roadmap topic in English.

Write each description using both English and Tamil.

Example:

Topic:
Variables and Data Types

Description:
Learn variables and data types in Java.
Java-வில் variables மற்றும் data types எப்படி
பயன்படுத்தப்படுகின்றன என்பதை கற்றுக்கொள்ளுங்கள்.
`;

        }

        // ========================================
        // OLLAMA PROMPT
        // ========================================

        const prompt = `
Create a personalized ${numberOfDays}-day learning roadmap
for the topic "${topic}".

Learning Level:
${learningLevel}

Preferred Language:
${preferredLanguage}

${languageInstruction}

IMPORTANT RULES:

1. Generate exactly ${numberOfDays} days.
2. Day numbers must start from 1.
3. Day numbers must continue in order.
4. Do not skip any day.
5. Every day must have a unique learning topic.
6. Topics must progress logically from basic to advanced.
7. Match the roadmap to the selected learning level.
8. Keep descriptions short and useful.
9. Do not repeat topics.
10. completed must always be false.
11. Follow the selected language exactly.
12. Make the roadmap practical for a student.

Return ONLY valid JSON.

Do not add markdown.
Do not add \`\`\`json.
Do not add explanations before or after the JSON.

Use exactly this structure:

{
    "roadmap": [
        {
            "day": 1,
            "topic": "Topic name",
            "description": "Short explanation",
            "completed": false
        }
    ]
}

Generate exactly ${numberOfDays} roadmap objects.
`;

        // ========================================
        // CALL OLLAMA API
        // ========================================

        console.log("OLLAMA ROADMAP GENERATION STARTED");

        const ollamaResponse = await fetch(
            "http://localhost:11434/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: "llama3.2:3b",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    stream: false,

                    keep_alive: "30m",

                    options: {
                        num_ctx: 2048,
                        num_predict: 2500
                    }

                })
            }
        );

        // ========================================
        // CHECK OLLAMA RESPONSE
        // ========================================

        if (!ollamaResponse.ok) {

            const errorData =
                await ollamaResponse.text();

            console.error(
                "Ollama API Error:",
                errorData
            );

            return res.status(500).json({
                success: false,
                message:
                    "Ollama AI request failed",
                error:
                    errorData
            });

        }

        const ollamaData =
            await ollamaResponse.json();

        // ========================================
        // GET OLLAMA TEXT
        // ========================================

        let aiText =
            ollamaData
                ?.message
                ?.content;

        if (!aiText) {

            console.error(
                "Empty Ollama response:",
                ollamaData
            );

            return res.status(500).json({
                success: false,
                message:
                    "Ollama returned an empty response"
            });

        }

        console.log("OLLAMA ROADMAP RESPONSE RECEIVED");

        // ========================================
        // CLEAN AI RESPONSE
        // ========================================

        aiText = aiText.trim();

        // Remove markdown JSON wrapper if model adds it
        aiText = aiText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        // ========================================
        // PARSE JSON
        // ========================================

        let parsedData;

        try {

            parsedData =
                JSON.parse(aiText);

        } catch (error) {

            console.error(
                "Ollama JSON Parse Error:",
                error.message
            );

            console.error(
                "Ollama Response:",
                aiText
            );

            return res.status(500).json({
                success: false,
                message:
                    "Ollama generated invalid JSON"
            });

        }

        // ========================================
        // GET ROADMAP ARRAY
        // ========================================

        let generatedRoadmap =
            parsedData?.roadmap;

        if (
            !Array.isArray(
                generatedRoadmap
            )
        ) {

            return res.status(500).json({
                success: false,
                message:
                    "Invalid roadmap format returned by Ollama"
            });

        }

        // ========================================
        // CHECK NUMBER OF DAYS
        // ========================================

        if (
            generatedRoadmap.length <
            numberOfDays
        ) {

            return res.status(500).json({
                success: false,
                message:
                    `Ollama generated ${generatedRoadmap.length} days instead of ${numberOfDays} days. Please try again.`
            });

        }

        // ========================================
        // NORMALIZE ROADMAP
        // ========================================

        generatedRoadmap =
            generatedRoadmap
                .slice(0, numberOfDays)
                .map(
                    function (item, index) {

                        return {

                            day:
                                index + 1,

                            topic:
                                item.topic ||
                                `Day ${index + 1}`,

                            description:
                                item.description ||
                                "Study this topic and practice the important concepts.",

                            completed:
                                false

                        };

                    }
                );

        // ========================================
        // SAVE ROADMAP TO MONGODB
        // ========================================

        const newRoadmap =
            await Roadmap.create({

                user:
                    req.user._id,

                topic:
                    topic,

                preferredLanguage:
                    preferredLanguage,

                learningLevel:
                    learningLevel,

                duration:
                    numberOfDays,

                roadmap:
                    generatedRoadmap

            });

        // ========================================
        // SEND RESPONSE
        // ========================================

        return res.status(201).json({

            success: true,

            message:
                "Personalized roadmap created successfully",

            roadmap:
                newRoadmap

        });

    } catch (error) {

        console.error(
            "Roadmap Create Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

});

// ========================================
// GET USER ROADMAPS
// ========================================

router.get(
    "/",
    protect,
    async (req, res) => {

        try {

            const roadmaps =
                await Roadmap.find({

                    user:
                        req.user._id

                })
                .sort({
                    createdAt: -1
                });

            return res.status(200).json({

                success: true,

                message:
                    "Roadmaps fetched successfully",

                roadmaps:
                    roadmaps

            });

        } catch (error) {

            console.error(
                "Roadmap Fetch Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error",

                error:
                    error.message

            });

        }

    }
);

module.exports = router;