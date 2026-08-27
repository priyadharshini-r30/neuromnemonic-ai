const generateQuiz = async (req, res) => {
    try {
        const { content, previousQuestions = [] } = req.body;

        if (!content) {
            return res.status(400).json({
                message: "Study content is required"
            });
        }

        // Convert previous questions into text for AI
        const previousQuestionsText =
            previousQuestions.length > 0
                ? previousQuestions
                    .map((question, index) =>
                        `${index + 1}. ${question}`
                    )
                    .join("\n")
                : "No previous questions.";

        const prompt = `
Create exactly 5 NEW multiple-choice questions from the study content below.

IMPORTANT:
- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT include explanations.
- Do NOT show the correct answer separately in the question text.
- Generate questions that are DIFFERENT from the previous questions.
- Do NOT repeat or rephrase the previous questions.

Previous Questions to Avoid:
${previousQuestionsText}

Use exactly this JSON format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0
    }
  ]
}

The answer value must be the option index:
0 = A
1 = B
2 = C
3 = D

Study Content:
${content}
`;

        const response = await fetch(
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

        const data = await response.json();

        let quiz;

        try {
            quiz = JSON.parse(data.response);
        } catch (parseError) {

            console.error("Quiz JSON Parse Error:", parseError);
            console.log("AI Response:", data.response);

            return res.status(500).json({
                success: false,
                message: "AI returned an invalid quiz format"
            });
        }

        res.json({
            success: true,
            quiz: quiz
        });

    } catch (error) {

        console.error("Quiz Generation Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate quiz"
        });
    }
};

module.exports = {
    generateQuiz
};