const askAITutor = async (req, res) => {
  try {

    const {
      question,
      history,
      currentTopic,
      preferredLanguage
    } = req.body;

    console.log("========================================");
    console.log("OLLAMA AI TUTOR CONTROLLER RUNNING");
    console.log("USER QUESTION:", question);
    console.log("CURRENT TOPIC:", currentTopic);
    console.log("PREFERRED LANGUAGE:", preferredLanguage);
    console.log("========================================");


    // ========================================
    // VALIDATE QUESTION
    // ========================================

    if (!question || question.trim() === "") {

      return res.status(400).json({
        success: false,
        message: "Question is required"
      });

    }


    // ========================================
    // CONVERSATION HISTORY
    // ========================================

    let conversationHistory = [];

    if (Array.isArray(history)) {

      conversationHistory = history
        .filter(
          (message) =>
            message &&
            (
              message.role === "user" ||
              message.role === "assistant"
            ) &&
            typeof message.content === "string"
        )
        .slice(-10);

    }


    // ========================================
    // LANGUAGE INSTRUCTION
    // ========================================

    let languageInstruction = "";


    if (preferredLanguage === "English") {

      languageInstruction = `
The student's selected language is English.

IMPORTANT:
- Answer only in simple English.
- Do not use Tamil.
- Do not use Tanglish.
- Do not use Hindi.
- Do not randomly switch languages.
- Technical terms may remain in English.
`;

    }

    else if (preferredLanguage === "Tamil") {

      languageInstruction = `
The student's selected language is Tamil.

Answer in readable Tamil script.

Technical terms such as Java, Python, HTML, CSS,
SQL, API and OOP may remain in English when necessary.

Do not randomly switch to Hindi.
`;

    }

    else if (preferredLanguage === "Bilingual") {

      languageInstruction = `
The student's selected language is Bilingual.

Use simple English together with readable Tamil.

Do not use Hindi.

Keep the explanation easy for a student to understand.
`;

    }

    else {

      languageInstruction = `
Detect the language used by the student.

English question:
Answer in simple English.

Tamil script question:
Answer in readable Tamil script.

Tanglish question:
Answer in simple Tanglish.

Mixed question:
Naturally follow the student's mixed language.

Never randomly switch to Hindi.
`;

    }


    // ========================================
    // CURRENT ROADMAP TOPIC
    // ========================================

    let topicInstruction = "";

    if (
      currentTopic &&
      typeof currentTopic === "string" &&
      currentTopic.trim() !== ""
    ) {

      topicInstruction = `
The student is currently studying this roadmap topic:

"${currentTopic}"

Use this topic as the main learning context.

If the student's question is related to this topic,
explain it according to this learning topic.

Do not unnecessarily move to a different topic unless
the student clearly asks for it.
`;

    }


    // ========================================
    // SYSTEM PROMPT
    // ========================================

    const systemPrompt = `
You are NeuroMnemonic AI, a friendly personalized AI tutor
for college students and competitive exam aspirants.

Your job is to teach the student clearly, simply and correctly.

========================================
LANGUAGE RULES
========================================

${languageInstruction}

========================================
PERSONALIZED TEACHING
========================================

${topicInstruction}

Use the available conversation context to understand
what the student is currently learning.

Do not repeatedly ask the student what topic they mean
when the topic is already available.

========================================
CONVERSATION RULES
========================================

- Remember previous messages in this conversation.
- Understand follow-up questions using previous context.
- If the student says:

  "explain simply"
  "in bullet points"
  "give example"
  "short ah"
  "more details"
  "continue"
  "explain again"

  understand what they are referring to from previous messages.

- Do not ask the student to repeat information that is
  already available.
- Do not give generic responses to meaningful questions.
- If the student changes the topic, follow the new topic.
- Do not introduce yourself repeatedly.

========================================
TEACHING RULES
========================================

- Teach the concept first.
- Explain clearly and simply.
- Break difficult concepts into smaller parts.
- Use examples when useful.
- Use headings and bullet points when appropriate.
- For college topics, give student-friendly explanations.
- For competitive exam topics, focus on important concepts.
- Do not unnecessarily make answers very long.
- If the student asks for detailed explanation,
  explain step by step.
- If the student asks for a short answer,
  keep it short.
- If the student asks for bullet points,
  use bullet points.
- Do not invent facts.
- If unsure, clearly say so.

========================================
MNEMONIC / STORY
========================================

Teach the concept normally first.

Do not automatically generate a mnemonic or story
after every explanation.

Mnemonic and Story are available through the separate
Mnemonic / Story page.

========================================
QUIZ
========================================

Do not automatically generate quiz questions
inside normal tutor responses.

The separate Quiz page can be used after learning
the topic.

========================================
CASUAL CHAT
========================================

- Be friendly and natural.
- If the student uses "da", you may naturally use "da".
- Keep greetings short.
- Do not repeatedly introduce yourself.

========================================
IMPORTANT
========================================

The latest student message is the most important.

Use previous conversation and current roadmap topic
to understand the student's learning context.

Always try to teach the student rather than simply
giving a one-line answer.
`;


    // ========================================
    // BUILD OLLAMA MESSAGES
    // ========================================

    const messages = [

      {
        role: "system",
        content: systemPrompt
      }

    ];


    // ========================================
    // ADD PREVIOUS CONVERSATION
    // ========================================

    conversationHistory.forEach(
      (message) => {

        messages.push({

          role: message.role,

          content: message.content

        });

      }
    );


    // ========================================
    // ADD CURRENT QUESTION
    // ========================================

    messages.push({

      role: "user",

      content: question.trim()

    });


    // ========================================
    // CALL OLLAMA
    // ========================================

    console.log(
      "Sending personalized conversation to Ollama..."
    );


    const response = await fetch(
      "http://localhost:11434/api/chat",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          model: "llama3.2:3b",

          messages: messages,

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


    // ========================================
    // OLLAMA ERROR
    // ========================================

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "OLLAMA HTTP ERROR:",
        errorText
      );

      return res.status(500).json({

        success: false,

        message: "Ollama request failed",

        error: errorText

      });

    }


    // ========================================
    // READ OLLAMA RESPONSE
    // ========================================

    const data =
      await response.json();


    const reply =
      data?.message?.content?.trim();


    console.log(
      "OLLAMA RESPONSE RECEIVED"
    );

    console.log(
      "AI REPLY:",
      reply
    );


    // ========================================
    // EMPTY RESPONSE
    // ========================================

    if (!reply) {

      return res.status(500).json({

        success: false,

        message:
          "Ollama did not return a response"

      });

    }


    // ========================================
    // SEND RESPONSE
    // ========================================

    return res.status(200).json({

      success: true,

      question: question,

      reply: reply

    });


  } catch (error) {

    console.error(
      "OLLAMA AI TUTOR ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Something went wrong with Ollama",

      error:
        error.message

    });

  }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
  askAITutor
};