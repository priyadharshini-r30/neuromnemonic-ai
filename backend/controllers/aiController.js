const askAITutor = async (req, res) => {
  try {
    const { question } = req.body;

    console.log("OLLAMA AI CONTROLLER IS RUNNING");
    console.log("USER QUESTION:", question);

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    const prompt = `
You are NeuroMnemonic AI, a friendly AI tutor for college students.

LANGUAGE RULES:
- If the user writes in English, reply in simple English.
- If the user writes in Tamil script, reply in readable Tamil script.
- If the user writes in Tanglish, reply in Tanglish using English alphabets.
- Do not unnecessarily change the user's language.

CHAT STYLE:
- Talk naturally like a friendly WhatsApp conversation.
- Keep casual messages short.
- If the user uses "da", you can naturally use "da".
- Do not sound like a textbook.
- For study questions, explain clearly with simple examples.
- Avoid unnecessarily long answers.

USER MESSAGE:
${question}
`;

    console.log("Sending request to Ollama...");

    const response = await fetch("http://localhost:11434/api/chat", {
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
          num_predict: 200
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("OLLAMA HTTP ERROR:", errorText);

      return res.status(500).json({
        success: false,
        message: "Ollama request failed",
        error: errorText
      });
    }

    const data = await response.json();

    const reply = data.message?.content;

    console.log("OLLAMA RESPONSE RECEIVED");

    if (!reply || reply.trim() === "") {
      return res.status(500).json({
        success: false,
        message: "Ollama did not return a response"
      });
    }

    return res.status(200).json({
      success: true,
      reply: reply.trim()
    });

  } catch (error) {

    console.error("OLLAMA AI ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong with Ollama",
      error: error.message
    });
  }
};

module.exports = {
  askAITutor
};