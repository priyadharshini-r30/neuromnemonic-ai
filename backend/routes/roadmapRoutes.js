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


        const numberOfDays =
            Number(duration);


        if (
            !Number.isInteger(numberOfDays) ||
            numberOfDays < 1
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Duration must be at least 1 day"
            });

        }


        // ========================================
        // LANGUAGE INSTRUCTION
        // ========================================

        let languageInstruction = "";


        if (
            preferredLanguage === "Tamil"
        ) {

            languageInstruction = `
The user selected Tamil.

Write ALL roadmap topics in Tamil.
Write ALL descriptions in Tamil.

Do NOT write English sentences.

Technical terms such as Java, Python, HTML, CSS,
SQL, API, OOP and similar programming terms
may remain in English when necessary.

Use simple Tamil that a student can easily understand.
`;

        }


        else if (
            preferredLanguage === "English"
        ) {

            languageInstruction = `
The user selected English.

Write ALL roadmap topics in English.
Write ALL descriptions in English.

Do not write Tamil.
Use simple and clear English.
`;

        }


        else if (
            preferredLanguage === "Bilingual"
        ) {

            languageInstruction = `
The user selected Bilingual.

Write each roadmap topic in English.

Write each description using both English and Tamil.

Example:

"topic": "Variables and Data Types"

"description":
"Learn variables and data types in Java.
Java-வில் variables மற்றும் data types எப்படி
பயன்படுத்தப்படுகின்றன என்பதை கற்றுக்கொள்ளுங்கள்."
`;

        }


        // ========================================
        // AI PROMPT
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
6. Topics should progress from basic to advanced according
   to the learning level.
7. Descriptions must be short and useful.
8. Do not repeat the same topic.
9. completed must always be false.
10. Follow the selected language exactly.

RETURN ONLY VALID JSON.

Do not use Markdown.
Do not use code fences.
Do not add explanations.
Do not add text before the JSON.
Do not add text after the JSON.

The JSON must have exactly this structure:

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

Generate exactly ${numberOfDays} objects.

Make the roadmap useful for a student who wants
to learn ${topic} step by step.
`;


        // ========================================
        // CALL OLLAMA
        // ========================================

        const aiResponse =
            await fetch(
                "http://localhost:11434/api/generate",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            model:
                                "llama3.2:3b",

                            prompt:
                                prompt,

                            stream:
                                false,

                            format:
                                "json"

                        })

                }
            );


        // ========================================
        // CHECK OLLAMA RESPONSE
        // ========================================

        if (!aiResponse.ok) {

            return res.status(500).json({

                success: false,

                message:
                    "Ollama AI request failed"

            });

        }


        const aiData =
            await aiResponse.json();


        if (
            !aiData.response
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "AI returned an empty response"

            });

        }


        // ========================================
        // CLEAN AI RESPONSE
        // ========================================

        let aiText =
            aiData.response.trim();


        aiText =
            aiText
                .replace(
                    /^```json\s*/i,
                    ""
                )
                .replace(
                    /^```\s*/i,
                    ""
                )
                .replace(
                    /\s*```$/i,
                    ""
                )
                .trim();


        // ========================================
        // PARSE JSON
        // ========================================

        let parsedData;


        try {

            parsedData =
                JSON.parse(aiText);

        }

        catch (error) {

            console.error(
                "AI JSON Parse Error:",
                error.message
            );

            console.error(
                "AI Response:",
                aiText
            );


            return res.status(500).json({

                success: false,

                message:
                    "AI generated invalid JSON"

            });

        }


        // ========================================
        // GET ROADMAP ARRAY
        // ========================================

        let generatedRoadmap =
            null;


        if (
            parsedData &&
            Array.isArray(
                parsedData.roadmap
            )
        ) {

            generatedRoadmap =
                parsedData.roadmap;

        }


        else if (
            Array.isArray(
                parsedData
            )
        ) {

            generatedRoadmap =
                parsedData;

        }


        // ========================================
        // CHECK ROADMAP FORMAT
        // ========================================

        if (
            !generatedRoadmap ||
            !Array.isArray(
                generatedRoadmap
            )
        ) {

            console.error(
                "Invalid AI roadmap:",
                parsedData
            );


            return res.status(500).json({

                success: false,

                message:
                    "Invalid roadmap format"

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
                    `AI generated ${generatedRoadmap.length} days instead of ${numberOfDays} days. Please try again.`

            });

        }


        // ========================================
        // NORMALIZE ROADMAP
        // ========================================

        generatedRoadmap =
            generatedRoadmap
                .slice(
                    0,
                    numberOfDays
                )
                .map(
                    function (
                        item,
                        index
                    ) {

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

    }


    catch (error) {

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

        }


        catch (error) {

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