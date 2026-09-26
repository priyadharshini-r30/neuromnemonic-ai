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

    const normalizedTopic = cleanTopic.toLowerCase();


    // ==================================================
    // SPECIAL CASE 1: JAVA OOP
    // ==================================================

    if (
      normalizedTopic.includes("java oop") ||
      normalizedTopic === "oop" ||
      normalizedTopic.includes("object oriented programming")
    ) {

      let mnemonicText;

      if (selectedLanguage === "Tamil") {

        mnemonicText = `
Mnemonic:
EIPA

Meaning:
Java OOP-இன் நான்கு முக்கிய pillars:

E - Encapsulation
I - Inheritance
P - Polymorphism
A - Abstraction

Example:
ஒரு Java class-ல் data-வை பாதுகாப்பாக வைத்திருப்பது Encapsulation.
ஒரு class மற்றொரு class-இன் properties மற்றும் methods-ஐ பெறுவது Inheritance.

Memory Tip:
Java OOP-ஐ நினைவில் வைக்க "EIPA" என்று நினைவில் வைத்துக்கொள்:
Encapsulation → Inheritance → Polymorphism → Abstraction.
`;

      } else {

        mnemonicText = `
Mnemonic:
EIPA

Meaning:
The four main pillars of Java OOP are:

E - Encapsulation
I - Inheritance
P - Polymorphism
A - Abstraction

Example:
A Java class can protect its data using Encapsulation, and one class can inherit features from another class using Inheritance.

Memory Tip:
Remember Java OOP using "EIPA":
Encapsulation → Inheritance → Polymorphism → Abstraction.
`;
      }

      return res.status(200).json({
        success: true,
        topic: cleanTopic,
        language: selectedLanguage,
        mnemonic: mnemonicText.trim()
      });
    }


    // ==================================================
    // SPECIAL CASE 2: PERCENTAGE
    // ==================================================

    if (
      normalizedTopic === "percentage" ||
      normalizedTopic === "percent"
    ) {

      let mnemonicText;

      if (selectedLanguage === "Tamil") {

        mnemonicText = `
Mnemonic:
"Part over Whole, times 100"

Meaning:
Percentage = (Part / Whole) × 100

Example:
25 என்பது 100-ல் எவ்வளவு percentage என்று பார்க்க:
(25 / 100) × 100 = 25%

Memory Tip:
Percentage நினைவில் வைக்க:
Part ÷ Whole × 100.
`;

      } else {

        mnemonicText = `
Mnemonic:
"Part over Whole, times 100"

Meaning:
Percentage = (Part / Whole) × 100

Example:
If 25 is taken from a whole of 100:
(25 / 100) × 100 = 25%

Memory Tip:
Remember:
Part ÷ Whole × 100.
`;
      }

      return res.status(200).json({
        success: true,
        topic: cleanTopic,
        language: selectedLanguage,
        mnemonic: mnemonicText.trim()
      });
    }


    // ==================================================
    // GENERAL TOPICS
    // ==================================================

    let topicInstruction = `
Identify the actual academic meaning of the topic first.

If the topic is a formula or calculation:
- Use a formula-based memory trick.
- Explain the formula correctly.
- Do not force it into an acronym.

If the topic is a concept:
- Use a meaningful keyword trick or short memory phrase.

If the topic is a list:
- Use a meaningful acronym only if appropriate.

Never create random words just to match letters.

The mnemonic must directly help the student remember the correct topic.
`;


    // ----------------------------
    // AI PROMPT
    // ----------------------------

    const prompt = `
You are NeuroMnemonic AI, an educational memory assistant.

Create a SHORT, CORRECT and USEFUL memory aid.

Student Topic:
${cleanTopic}

Output Language:
${selectedLanguage}

${topicInstruction}

IMPORTANT RULES:

1. Understand the actual academic meaning before creating the mnemonic.
2. Never invent academic facts.
3. Never create meaningless acronym expansions.
4. Do not force every topic into an acronym.
5. Choose the most suitable memory technique.
6. The memory aid must help the student remember the actual topic.
7. Keep the explanation simple.
8. Give one correct example.
9. Maximum 100 words.
10. Do not add unnecessary information.

LANGUAGE RULES:

- If Output Language is Tamil, write in readable Tamil script.
- Do NOT use Tanglish when Tamil is selected.
- Technical terms may remain in English when necessary.
- If Output Language is English, use simple English.
- Never randomly switch to Hindi or another language.

Return ONLY this format:

Mnemonic:
[One short and meaningful memory trick]

Meaning:
[Brief correct explanation]

Example:
[One simple correct example]

Memory Tip:
[One short practical memory tip]

Do not add anything before or after this format.
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
            temperature: 0.2,
            num_ctx: 1024,
            num_predict: 220
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


    const data = await response.json();

    const result = data?.response?.trim();

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "AI returned an empty response"
      });
    }


    // ----------------------------
    // SUCCESS RESPONSE
    // ----------------------------

    return res.status(200).json({
      success: true,
      topic: cleanTopic,
      language: selectedLanguage,
      mnemonic: result
    });


  } catch (error) {

    console.error(
      "Mnemonic Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate mnemonic"
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

    const cleanTopic = topic.trim();

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

- First understand the correct meaning of the topic.
- Focus only on the exact topic.
- Use academically correct information.
- Do not invent technical facts.
- The story must help the student understand and remember the topic.
- Keep the story short.
- Maximum 120 words.
- Use one simple situation or example.
- Do not create unnecessary characters.
- Do not write a long explanation.

IMPORTANT:
The story is a memory aid, not a replacement for the actual academic definition.

LANGUAGE RULES:

- If Output Language is Tamil, write the complete story in readable Tamil script.
- Do NOT use Tanglish when Tamil is selected.
- If Output Language is English, use simple English.
- Technical terms may remain in English when necessary.
- Never randomly switch to Hindi or another language.

Return ONLY this format:

Title:
[Short title]

Story:
[Short educational story]

What to Remember:
[Maximum 3 short points]

Do not add anything before or after this format.
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
            temperature: 0.2,
            num_ctx: 1024,
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


    const data = await response.json();

    const result = data?.response?.trim();


    if (!result) {

      return res.status(500).json({
        success: false,
        message: "AI returned an empty response"
      });
    }


    // ----------------------------
    // SUCCESS RESPONSE
    // ----------------------------

    return res.status(200).json({
      success: true,
      topic: cleanTopic,
      language: selectedLanguage,
      story: result
    });


  } catch (error) {

    console.error(
      "Story Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate story"
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