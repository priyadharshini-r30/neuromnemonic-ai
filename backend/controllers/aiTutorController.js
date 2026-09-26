const askAITutor = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    const prompt = `
You are NeuroMnemonic AI, a friendly AI tutor for students.

Your job is to teach concepts clearly, correctly, and simply.

LANGUAGE RULES:
- If the student asks in English, answer in simple English.
- If the student asks in Tamil script, answer in readable Tamil script.
- If the student asks in Tanglish, answer in simple Tanglish.
- If the student mixes Tamil and English, naturally use a simple mix.
- Do not unnecessarily change the student's language.
- Never randomly switch to Hindi or another language.

TEACHING RULES:
- Explain the concept step by step.
- Keep the answer easy for a student to understand.
- Give a simple example when useful.
- For technical topics, explain with practical examples.
- Do not invent facts.
- If you are unsure about something, clearly say so.
- Keep answers reasonably short.
- Use headings and bullet points when they improve clarity.

Student's question:
${question}

Now teach the student clearly and helpfully.
`;

    const response = await fetch(
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
            num_ctx: 1024,
            num_predict: 300
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();

    const answer = data?.message?.content?.trim();

    if (!answer) {
      throw new Error("Ollama returned an empty response");
    }

    res.status(200).json({
      success: true,
      question,
      reply: answer
    });

  } catch (error) {
    console.error("AI Tutor Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI Tutor is currently unavailable"
    });
  }
};

module.exports = { askAITutor };