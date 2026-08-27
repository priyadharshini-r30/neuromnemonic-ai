const generateBtn = document.getElementById("generateBtn");
const topicInput = document.getElementById("topic");
const languageSelect = document.getElementById("language");
const typeSelect = document.getElementById("type");
const resultDiv = document.getElementById("result");
const loadingDiv = document.getElementById("loading");
const quizBtn = document.getElementById("quizBtn");

// Store generated mnemonic/story
let generatedContent = "";


// ===============================
// Generate Mnemonic / Story
// ===============================
generateBtn.addEventListener("click", async () => {

    const topic = topicInput.value.trim();
    const language = languageSelect.value;
    const type = typeSelect.value;

    // Check topic
    if (!topic) {
        alert("Please enter a topic!");
        return;
    }

    // Hide quiz button until new content is generated
    quizBtn.style.display = "none";

    // Clear old quiz data
    sessionStorage.removeItem("generatedQuiz");
    sessionStorage.removeItem("previousQuestions");
    sessionStorage.removeItem("generatedContent");

    // Show loading
    loadingDiv.style.display = "block";
    resultDiv.textContent = "";

    try {

        let endpoint;

        // Select API based on generation type
        if (type === "mnemonic") {

            endpoint =
                "http://localhost:5000/api/mnemonic/mnemonic";

        } else {

            endpoint =
                "http://localhost:5000/api/mnemonic/story";
        }


        // Send request to backend
        const response = await fetch(endpoint, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                topic: topic,
                language: language
            })
        });


        const data = await response.json();


        // Handle backend error
        if (!response.ok) {

            throw new Error(
                data.message || "Generation failed"
            );
        }


        // ===============================
        // Store Generated Content
        // ===============================
        if (type === "mnemonic") {

            generatedContent = data.mnemonic;

            resultDiv.textContent =
                generatedContent;

        } else {

            generatedContent = data.story;

            resultDiv.textContent =
                generatedContent;
        }


        // ===============================
        // Save Content for Quiz
        // ===============================
        if (generatedContent) {

            sessionStorage.setItem(
                "generatedContent",
                generatedContent
            );

            quizBtn.style.display = "block";
        }


    } catch (error) {

        console.error(
            "Generation Error:",
            error
        );

        generatedContent = "";

        resultDiv.textContent =
            "❌ Failed to generate. Please make sure the backend server and Ollama are running.";

    } finally {

        // Hide loading
        loadingDiv.style.display = "none";
    }
});


// ===============================
// Generate Quiz
// ===============================
quizBtn.addEventListener("click", async () => {

    if (!generatedContent) {

        alert(
            "Please generate a mnemonic or story first!"
        );

        return;
    }


    try {

        // Disable button
        quizBtn.disabled = true;

        quizBtn.textContent =
            "Generating Quiz... ⏳";


        // Get previous questions
        const previousQuestions =
            JSON.parse(
                sessionStorage.getItem(
                    "previousQuestions"
                ) || "[]"
            );


        // ===============================
        // Send Content to Quiz API
        // ===============================
        const response = await fetch(
            "http://localhost:5000/api/quiz/generate",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    content: generatedContent,

                    previousQuestions:
                        previousQuestions
                })
            }
        );


        const data =
            await response.json();


        // Handle backend error
        if (!response.ok) {

            throw new Error(
                data.message ||
                "Quiz generation failed"
            );
        }


        // ===============================
        // Save Quiz
        // ===============================
        sessionStorage.setItem(
            "generatedQuiz",
            JSON.stringify(data.quiz)
        );


        // ===============================
        // Store Questions
        // ===============================
        const newQuestions =
            data.quiz.questions.map(
                question =>
                    question.question
            );


        sessionStorage.setItem(
            "previousQuestions",
            JSON.stringify([
                ...previousQuestions,
                ...newQuestions
            ])
        );


        console.log(
            "Quiz saved:",
            data.quiz
        );


        console.log(
            "Previous questions:",
            [
                ...previousQuestions,
                ...newQuestions
            ]
        );


        // ===============================
        // Open Quiz Page
        // ===============================
        window.location.href =
            "quiz.html";


    } catch (error) {

        console.error(
            "Quiz Error:",
            error
        );

        alert(
            "❌ Failed to generate quiz. Please make sure the backend server and Ollama are running."
        );

    } finally {

        // Enable button
        quizBtn.disabled = false;

        quizBtn.textContent =
            "🎯 Take Quiz";
    }
});