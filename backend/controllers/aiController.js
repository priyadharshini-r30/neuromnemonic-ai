
exports.askAITutor = async (req, res) => {
    try {
        const {
            question,
            history,
            currentTopic,
            preferredLanguage,
            mode
        } = req.body;

        // Validate the user's question.
        if (!question || typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a question."
            });
        }

        const cleanQuestion = question.trim();

        // Keep only valid user/assistant conversation messages.
        const conversationHistory = Array.isArray(history)
            ? history
                .filter(
                    (item) =>
                        item &&
                        ["user", "assistant"].includes(item.role) &&
                        typeof item.content === "string" &&
                        item.content.trim()
                )
                .slice(-10)
                .map((item) => ({
                    role: item.role,
                    content: item.content.trim()
                }))
            : [];

        let systemPrompt;

        // Dashboard AI Chat Tutor instructions only.
        if (mode === "dashboard-chat") {
            systemPrompt = `
You are the AI Chat Assistant on the NeuroMnemonic AI dashboard.

Follow these rules carefully:
1. Answer the user's current question directly and accurately.
2. If the user asks in English, respond ONLY in simple, clear English.
3. If the user asks in Tamil, respond in Tamil.
4. If the user uses another language, respond in that language when possible.
5. Do not switch to Tamil when the user asks in English.
6. Explain concepts in easy words, suitable for a student.
7. Give one relevant example when it helps the explanation.
8. Do not repeat the same sentence, paragraph, or idea.
9. Use conversation history to understand follow-up questions.
10. Do not introduce unrelated mnemonics, stories, or quizzes unless requested.
11. If the question is unclear, ask a short clarifying question.
12. Never claim that you performed an action that you did not perform.
13. Keep answers focused and avoid unnecessary repetition.
`;
        } else {
            // Preserve the general AI Tutor behavior for other requests.
            let languageInstruction = "";

            if (preferredLanguage === "English") {
                languageInstruction =
                    "Respond in simple English only.";
            } else if (preferredLanguage === "Tamil") {
                languageInstruction =
                    "Respond in Tamil script.";
            } else if (preferredLanguage === "Bilingual") {
                languageInstruction =
                    "Respond in both English and Tamil where appropriate.";
            } else {
                languageInstruction = `
Detect the language used by the user.
If the user writes in Tamil script, respond in Tamil script.
If the user writes in English, respond in simple English.
If the user writes in Tanglish, respond naturally in Tanglish.
`;
            }

            systemPrompt = `
You are NeuroMnemonic AI, a personalized learning assistant
for students and competitive examination aspirants.

LANGUAGE:
${languageInstruction}

${currentTopic ? `CURRENT LEARNING TOPIC: ${currentTopic}` : ""}

CONVERSATION:
- Use the conversation history to understand follow-up questions.
- Answer the user's actual question.
- Keep explanations clear and student-friendly.
- Avoid repeating the same information unnecessarily.
- If the user asks a follow-up, connect it to the previous discussion.

TEACHING:
- Explain the concept first.
- Use simple examples where helpful.
- When requested or relevant, provide a suitable mnemonic or story
  that correctly matches the topic.
- Generate quizzes only when requested.
- For casual conversation, respond naturally and appropriately.
- Do not invent facts when uncertain.
`;
        }

        const messages = [
            {
                role: "system",
                content: systemPrompt
            },
            ...conversationHistory,
            {
                role: "user",
                content: cleanQuestion
            }
        ];

        // Keep the existing Ollama model and endpoint.
        const ollamaResponse = await fetch(
            "http://localhost:11434/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3.2:3b",
                    messages,
                    stream: false,
                    keep_alive: "30m",
                    options: {
                        num_ctx: 2048,
                        num_predict: 300,
                        temperature: 0.2
                    }
                })
            }
        );

        if (!ollamaResponse.ok) {
            const errorText = await ollamaResponse.text();

            console.error("Ollama error:", errorText);

            return res.status(502).json({
                success: false,
                message:
                    "The AI service could not process your question. Please try again."
            });
        }

        const data = await ollamaResponse.json();

        const reply = data?.message?.content?.trim();

        if (!reply) {
            return res.status(502).json({
                success: false,
                message: "The AI returned an empty response. Please try again."
            });
        }

        return res.status(200).json({
            success: true,
            question: cleanQuestion,
            reply
        });
    } catch (error) {
        console.error("AI Tutor Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while processing your question."
        });
    }
};
