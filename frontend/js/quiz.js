const quizContent = document.getElementById("quizContent");

// ===============================
// Get Quiz
// ===============================
const quizData = sessionStorage.getItem("generatedQuiz");

console.log("Quiz data:", quizData);

let quiz;

try {
    quiz = JSON.parse(quizData);
} catch (error) {
    console.error("Quiz parsing error:", error);
    quiz = null;
}


// ===============================
// Check Quiz
// ===============================
if (!quiz || !quiz.questions || quiz.questions.length === 0) {

    quizContent.innerHTML = `
        <div class="error-message">
            ❌ No quiz found.
            <br><br>
            Please go back and generate a quiz first.
        </div>
    `;

} else {

    displayQuiz(quiz);
}


// ===============================
// Display Quiz
// ===============================
function displayQuiz(quiz) {

    quizContent.innerHTML = "";

    const form = document.createElement("form");

    form.id = "quizForm";


    quiz.questions.forEach((item, index) => {

        const questionBox = document.createElement("div");

        questionBox.className = "question-box";

        questionBox.innerHTML = `
            <h3>
                ${index + 1}. ${escapeHTML(item.question)}
            </h3>
        `;


        item.options.forEach((option, optionIndex) => {

            const optionLabel = document.createElement("label");

            optionLabel.className = "option";

            optionLabel.innerHTML = `
                <input
                    type="radio"
                    name="question${index}"
                    value="${optionIndex}"
                >

                <span>
                    ${escapeHTML(option)}
                </span>
            `;

            questionBox.appendChild(optionLabel);
        });


        form.appendChild(questionBox);
    });


    // ===============================
    // Submit Button
    // ===============================
    const submitButton = document.createElement("button");

    submitButton.type = "submit";
    submitButton.id = "submitQuiz";
    submitButton.textContent = "✅ Submit Quiz";

    form.appendChild(submitButton);


    // ===============================
    // Result
    // ===============================
    const resultDiv = document.createElement("div");

    resultDiv.id = "quizResult";

    form.appendChild(resultDiv);


    quizContent.appendChild(form);


    form.addEventListener("submit", function (event) {

        event.preventDefault();

        checkAnswers(quiz);

    });
}


// ===============================
// Check Answers
// ===============================
function checkAnswers(quiz) {

    let score = 0;
    let answered = 0;

    let resultHTML = `
        <div class="result-summary">
            <h2>🎉 Quiz Completed!</h2>
        </div>
    `;


    quiz.questions.forEach((item, index) => {

        const selected = document.querySelector(
            `input[name="question${index}"]:checked`
        );


        if (selected) {

            answered++;

            const userAnswer = Number(selected.value);

            if (userAnswer === item.answer) {
                score++;
            }
        }
    });


    // ===============================
    // Score
    // ===============================
    resultHTML += `
        <div class="score">

            <h2>
                📊 Your Score: ${score} / ${quiz.questions.length}
            </h2>

            <p>
                Answered: ${answered} / ${quiz.questions.length}
            </p>

        </div>
    `;


    // ===============================
    // Answer Review
    // ===============================
    quiz.questions.forEach((item, index) => {

        const selected = document.querySelector(
            `input[name="question${index}"]:checked`
        );


        const userAnswer = selected
            ? Number(selected.value)
            : -1;


        const isCorrect = userAnswer === item.answer;


        resultHTML += `
            <div class="answer-review">

                <h3>
                    Question ${index + 1}
                </h3>

                <p>
                    ${escapeHTML(item.question)}
                </p>

                <p>
                    <strong>Your Answer:</strong>

                    ${
                        userAnswer >= 0
                            ? escapeHTML(
                                item.options[userAnswer]
                            )
                            : "Not answered"
                    }
                </p>

                <p>
                    <strong>Correct Answer:</strong>

                    ${escapeHTML(
                        item.options[item.answer]
                    )}
                </p>

                <p class="${isCorrect ? "correct" : "incorrect"}">

                    ${
                        isCorrect
                            ? "✅ Correct"
                            : "❌ Incorrect"
                    }

                </p>

            </div>
        `;
    });


    // ===============================
    // Try Another Quiz Button
    // ===============================
    resultHTML += `
        <div class="another-quiz-container">

            <button
                type="button"
                id="anotherQuizBtn"
            >
                🔄 Try Another Quiz
            </button>

        </div>
    `;


    const resultDiv =
        document.getElementById("quizResult");

    resultDiv.innerHTML = resultHTML;


    // Disable answers
    document
        .querySelectorAll("#quizForm input")
        .forEach(input => {
            input.disabled = true;
        });


    // Disable submit
    document
        .getElementById("submitQuiz")
        .disabled = true;


    // ===============================
    // Try Another Quiz
    // ===============================
    document
        .getElementById("anotherQuizBtn")
        .addEventListener("click", generateAnotherQuiz);
}


// ===============================
// Generate Another Quiz
// ===============================
async function generateAnotherQuiz() {

    const button =
        document.getElementById("anotherQuizBtn");

    button.disabled = true;
    button.textContent = "Generating New Quiz... ⏳";


    try {

        // Get study content
        const generatedContent =
            sessionStorage.getItem("generatedContent");

        /*
         * If generatedContent is not available,
         * go back to mnemonic page.
         */
        if (!generatedContent) {

            alert(
                "Please generate the study content again."
            );

            window.location.href = "mnemonic.html";

            return;
        }


        // Get previous questions
        const previousQuestions =
            JSON.parse(
                sessionStorage.getItem(
                    "previousQuestions"
                ) || "[]"
            );


        const response = await fetch(
            "http://localhost:5000/api/quiz/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    content: generatedContent,
                    previousQuestions: previousQuestions
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "New quiz generation failed"
            );
        }


        // Save new quiz
        sessionStorage.setItem(
            "generatedQuiz",
            JSON.stringify(data.quiz)
        );


        // Save new questions
        const newQuestions =
            data.quiz.questions.map(
                question => question.question
            );


        sessionStorage.setItem(
            "previousQuestions",
            JSON.stringify([
                ...previousQuestions,
                ...newQuestions
            ])
        );


        // Reload quiz page
        window.location.reload();


    } catch (error) {

        console.error(
            "Another Quiz Error:",
            error
        );

        alert(
            "❌ Failed to generate another quiz."
        );

        button.disabled = false;

        button.textContent =
            "🔄 Try Another Quiz";
    }
}


// ===============================
// Security Helper
// ===============================
function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}