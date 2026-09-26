const askAITutor = async (req, res) => {
  console.log("🔥 AI CONTROLLER IS RUNNING");

  try {
    const { question } = req.body;

    console.log("🔥 USER QUESTION:", question);

    // Check question
    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    const lowerMessage = question.trim().toLowerCase();

    // -----------------------------------
    // TEMPORARY TEST
    // -----------------------------------
    if (lowerMessage === "hi da") {
      console.log("🔥 HI DA MATCHED - NOT GOING TO OLLAMA");

      return res.status(200).json({
        success: true,
        reply: "Hi da 😄 enna help venum?"
      });
    }

    // -----------------------------------
    // Ollama
    // -----------------------------------
    console.log("🔥 Sending to Ollama:", question);

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "llama3.2:3b",

          prompt: `
You are NeuroMnemonic AI, a friendly AI tutor.

IMPORTANT:
Always understand the user's actual intention.

LANGUAGE RULE:

If the user writes in Tanglish,
reply in Tanglish using English alphabets.

If the user writes in Tamil script,
reply in Tanglish using English alphabets.

If the user writes in English,
reply in simple English.

NEVER use Tamil Unicode characters.

CHAT STYLE:

Talk naturally like a friendly WhatsApp conversation.

Use simple and casual language.

If the user uses "da", you can naturally use "da".

Do not sound like a textbook.

Do not translate the user's message.

Do not create unnecessary definitions.

Do not turn casual conversation into a study lesson.

For casual messages, give a short natural reply.

For study questions, give a clear and useful explanation.

Example:

User:
"ennada pandra nee"

Good:
"Onnum illa da 😄 un kooda pesitu iruken. Enna venum?"

User:
"saptiya?"

Good:
"Naan AI da 😂 enakku sapadu thevai illa. Nee saptiya?"

User:
"inheritance na enna da?"

Good:
"Inheritance na oru class-oda properties and methods-ah innoru class reuse pannradhu da. Java-la code reusability-ku useful."

User:
"What is inheritance in Java?"

Good:
"Inheritance is a feature in Java where one class can reuse the properties and methods of another class."

Remember:

NEVER reply in Tamil Unicode.

Always use English alphabets for Tamil/Tanglish replies.

USER MESSAGE:
${question}
`,

          stream: false
        })
      }
    );

    // -----------------------------------
    // Check Ollama Response
    // -----------------------------------
    if (!response.ok) {
      console.log("🔥 OLLAMA ERROR:", response.status);

      return res.status(500).json({
        success: false,
        message: "AI service error"
      });
    }

    const data = await response.json();

    console.log("🔥 OLLAMA RESPONSE RECEIVED");

    // -----------------------------------
    // Check AI Response
    // -----------------------------------
    if (!data.response || data.response.trim() === "") {
      return res.status(500).json({
        success: false,
        message: "AI did not return a response"
      });
    }

    // -----------------------------------
    // Send AI Reply
    // -----------------------------------
    return res.status(200).json({
      success: true,
      reply: data.response.trim()
    });

  } catch (error) {

    console.error("🔥 AI CONTROLLER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong with AI Tutor",
      error: error.message
    });
  }
};

module.exports = {
  askAITutor
};