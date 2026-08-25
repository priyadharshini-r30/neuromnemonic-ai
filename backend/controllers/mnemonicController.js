const generateMnemonic = async (req, res) => {
  try {
    const { topic, language = "English" } = req.body;

    if (!topic) {
      return res.status(400).json({
        message: "Topic is required",
      });
    }

    let conceptGuide = "";

    const normalizedTopic = topic.toLowerCase();

    // Verified concepts for common programming topics
    if (
      normalizedTopic.includes("java oop") ||
      normalizedTopic.includes("oop") ||
      normalizedTopic.includes("object oriented programming")
    ) {
      conceptGuide = `
For Java OOP, there are EXACTLY FOUR fundamental pillars:

1. Encapsulation - bundling data and methods together and controlling access.
2. Inheritance - a class acquiring properties and methods from another class.
3. Polymorphism - one interface or method name having different forms or behaviors.
4. Abstraction - hiding implementation details and showing essential features.

The mnemonic MUST use:
E = Encapsulation
I = Inheritance
P = Polymorphism
A = Abstraction

Do NOT add Constructor, Life Cycle, Subclass, Superclass, Class Hierarchy,
or any other concept as one of the four OOP pillars.
`;
    }

    const prompt = `
You are NeuroMnemonic AI, an accurate educational assistant.

Create a simple, accurate, and easy-to-remember mnemonic.

Topic: ${topic}
Requested Language: ${language}

${conceptGuide}

STRICT ACCURACY RULES:
- Use only verified concepts.
- Never invent concepts.
- Never add extra concepts.
- Do not change the technical meaning of concepts.
- For Java OOP, there are EXACTLY FOUR fundamental pillars.
- The mnemonic MUST be exactly E-I-P-A.
- E MUST mean Encapsulation.
- I MUST mean Inheritance.
- P MUST mean Polymorphism.
- A MUST mean Abstraction.
- Never create extra letters.
- Keep technical terms such as Encapsulation, Inheritance,
  Polymorphism, and Abstraction in English.
- Do not translate technical programming terms into incorrect Tamil words.

LANGUAGE RULES:
- If language is Tamil, explain the meanings and memory tip in simple Tamil.
- If language is English, explain the meanings and memory tip in simple English.
- Do NOT use Tanglish.
- Do NOT use Bilingual output.

The mnemonic must help students remember the correct academic concepts.

Return ONLY this format:

Mnemonic:
E - Encapsulation
I - Inheritance
P - Polymorphism
A - Abstraction

Meaning:
E - [Simple ${language} explanation of Encapsulation]
I - [Simple ${language} explanation of Inheritance]
P - [Simple ${language} explanation of Polymorphism]
A - [Simple ${language} explanation of Abstraction]

Memory Tip:
[One short and accurate ${language} memory tip]

Do not add anything before or after this format.
`;

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      return res.status(500).json({
        message: "AI server error",
      });
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      topic,
      language,
      mnemonic: data.response,
    });

  } catch (error) {
    console.error("Mnemonic Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate mnemonic",
    });
  }
};


const generateStory = async (req, res) => {
  try {
    const { topic, language = "English" } = req.body;

    if (!topic) {
      return res.status(400).json({
        message: "Topic is required",
      });
    }

    const prompt = `
You are NeuroMnemonic AI, an accurate and creative educational assistant.

Create a short, memorable, and academically correct educational story.

Topic: ${topic}
Requested Language: ${language}

RULES:
- Use only correct and verified facts.
- Never invent academic facts.
- Keep the story short and easy to remember.
- Make the story useful for students and exam preparation.
- If language is Tamil, write the explanation in simple Tamil.
- If language is English, write the explanation in simple English.
- Do NOT use Tanglish.
- Do NOT use Bilingual output.
- Keep important technical programming terms in English.
- Do not change the technical meaning of any concept.

Return ONLY this format:

Title:
[Short title]

Story:
[Short educational story]

What to Remember:
[Important concepts]
`;

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      return res.status(500).json({
        message: "AI server error",
      });
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      topic,
      language,
      story: data.response,
    });

  } catch (error) {
    console.error("Story Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate story",
    });
  }
};


module.exports = {
  generateMnemonic,
  generateStory,
};