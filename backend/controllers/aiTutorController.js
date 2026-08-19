const askAITutor = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.2:3b",

        prompt: `You are NeuroMnemonic AI, a friendly AI tutor for students.

Your job is to explain concepts clearly and simply.

IMPORTANT LANGUAGE RULE:
- Answer in the same language used by the student.
- If the student asks in English, answer in simple English.
- If the student asks in Tamil, answer in Tamil.
- If the student asks in Tanglish (Tamil written using English letters), answer in simple Tanglish.
- Do not unnecessarily change the student's language.
- If the student mixes Tamil and English, you may naturally use a simple mix of Tamil and English.
- Keep the explanation student-friendly and easy to understand.

FORMATTING RULES:
- Use short paragraphs.
- Use headings when useful.
- Use numbered lists or bullet points when appropriate.
- Highlight important terms using **bold**.
- Avoid unnecessary long explanations.
- Give examples when they help understanding.

Student's question:
${question}

Now answer the student's question following all the rules above.`,

        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      question,
      answer: data.response
    });

  } catch (error) {
    console.error("AI Tutor Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI Tutor is currently unavailable",
      error: error.message
    });
  }
};

module.exports = { askAITutor };