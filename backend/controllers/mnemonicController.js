// ============================================
// NeuroMnemonic AI
// Mnemonic & Story Controller
// ============================================


// ============================================
// GENERATE MNEMONIC
// ============================================

const generateMnemonic = async (req, res) => {
  try {

    const { topic, language = "English" } = req.body;


    // ----------------------------
    // VALIDATION
    // ----------------------------

    if (!topic || topic.trim() === "") {

      return res.status(400).json({
        success: false,
        message: "Topic is required"
      });

    }


    // ----------------------------
    // NORMALIZE VALUES
    // ----------------------------

    const cleanTopic = topic.trim();

    const selectedLanguage =
      language === "Tamil"
        ? "Tamil"
        : "English";


    // ----------------------------
    // SPECIAL INSTRUCTION
    // ----------------------------

    let topicInstruction = `
Focus only on the topic given by the student.
Do not change the topic.
Do not assume the topic is Java OOP.
`;


    const normalizedTopic =
      cleanTopic.toLowerCase();


    // Special rule only for Java OOP
    if (
      normalizedTopic.includes("java oop") ||
      normalizedTopic.includes("object oriented programming")
    ) {

      topicInstruction = `
The topic is Java OOP.

Use the four important OOP pillars:

E - Encapsulation
I - Inheritance
P - Polymorphism
A - Abstraction

Create a SHORT memory trick for these concepts.
Do not add extra OOP pillars.
`;

    }


    // ----------------------------
    // AI PROMPT
    // ----------------------------

    const prompt = `
You are NeuroMnemonic AI, a helpful educational assistant.

Your task is to create a SHORT and EASY memory aid.

Student Topic:
${cleanTopic}

Output Language:
${selectedLanguage}

${topicInstruction}

STRICT RULES:

- ALWAYS provide a helpful answer.
- NEVER refuse the student's topic.
- NEVER say "I cannot create a mnemonic".
- NEVER write a story.
- NEVER write a long paragraph.
- Keep the complete response SHORT.
- Use only academically correct information.
- Do not invent technical facts.
- Create a mnemonic, acronym, keyword trick, or short memory phrase.
- The memory aid must relate directly to the student's topic.
- If the topic is broad, use its important basic concepts.
- Maximum 80 words total.

LANGUAGE RULES:

- If Output Language is Tamil, write the explanation in Tamil script.
- Do NOT write Tanglish when Tamil is selected.
- If Output Language is English, write only simple English.
- Keep technical terms in English when necessary.

Return ONLY in this exact format:

Mnemonic:
[One short mnemonic or memory phrase]

Meaning:
[One or two short lines]

Memory Tip:
[One short line]

Do not add anything before or after the format.
`;


    // ----------------------------
    // CALL OLLAMA
    // ----------------------------

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

          stream: false,

          options: {

            temperature: 0.3,

            num_predict: 180

          }

        })

      }
    );


    // ----------------------------
    // OLLAMA ERROR
    // ----------------------------

    if (!response.ok) {

      return res.status(500).json({

        success: false,

        message: "AI server error"

      });

    }


    const data =
      await response.json();


    // ----------------------------
    // SUCCESS RESPONSE
    // ----------------------------

    res.status(200).json({

      success: true,

      topic: cleanTopic,

      language: selectedLanguage,

      mnemonic:
        data.response.trim()

    });


  } catch (error) {

    console.error(
      "Mnemonic Error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "Failed to generate mnemonic"

    });

  }
};



// ============================================
// GENERATE STORY
// ============================================

const generateStory = async (req, res) => {

  try {

    const { topic, language = "English" } = req.body;


    // ----------------------------
    // VALIDATION
    // ----------------------------

    if (!topic || topic.trim() === "") {

      return res.status(400).json({

        success: false,

        message: "Topic is required"

      });

    }


    // ----------------------------
    // NORMALIZE VALUES
    // ----------------------------

    const cleanTopic =
      topic.trim();


    const selectedLanguage =
      language === "Tamil"
        ? "Tamil"
        : "English";


    // ----------------------------
    // AI PROMPT
    // ----------------------------

    const prompt = `
You are NeuroMnemonic AI, a helpful educational assistant.

Create a SHORT, SIMPLE and MEMORABLE educational story.

Student Topic:
${cleanTopic}

Output Language:
${selectedLanguage}

STRICT RULES:

- Focus only on the student's exact topic.
- ALWAYS provide a helpful educational story.
- NEVER refuse the request.
- Do not say "I cannot create a story".
- Use academically correct information.
- Do not invent technical facts.
- The story must help a student understand and remember the topic.
- Keep the story SHORT.
- Maximum 120 words for the complete story.
- Use only one simple example or situation.
- Do not create unnecessary characters.
- Do not write a long explanation.

LANGUAGE RULES:

- If Output Language is Tamil, write the complete story in Tamil script.
- Do NOT use Tanglish when Tamil is selected.
- If Output Language is English, write only simple English.
- Keep technical terms in English when necessary.

Return ONLY in this exact format:

Title:
[Short title]

Story:
[Short story, maximum 120 words]

What to Remember:
[Maximum 3 short points]

Do not add anything before or after the format.
`;


    // ----------------------------
    // CALL OLLAMA
    // ----------------------------

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

          stream: false,

          options: {

            temperature: 0.3,

            num_predict: 350

          }

        })

      }
    );


    // ----------------------------
    // OLLAMA ERROR
    // ----------------------------

    if (!response.ok) {

      return res.status(500).json({

        success: false,

        message: "AI server error"

      });

    }


    const data =
      await response.json();


    // ----------------------------
    // SUCCESS RESPONSE
    // ----------------------------

    res.status(200).json({

      success: true,

      topic: cleanTopic,

      language: selectedLanguage,

      story:
        data.response.trim()

    });


  } catch (error) {

    console.error(
      "Story Error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "Failed to generate story"

    });

  }

};



// ============================================
// EXPORT FUNCTIONS
// ============================================

module.exports = {

  generateMnemonic,

  generateStory

};