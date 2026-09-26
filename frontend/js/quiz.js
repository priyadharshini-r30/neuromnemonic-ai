const quizContent =
    document.getElementById("quizContent");

const quizData =
    sessionStorage.getItem("generatedQuiz");

console.log(
    "Quiz data:",
    quizData
);

let quiz;

try {
    quiz =
        JSON.parse(quizData);
} catch (error) {
    console.error(
        "Quiz parsing error:",
        error
    );
    quiz = null;
}

if (
    !quiz ||
    !quiz.questions ||
    quiz.questions.length === 0
) {
    quizContent.innerHTML = `
        <div class="error-message">
            ❌ No quiz found.
            <br><br>
            Please go back and generate
            a quiz first.
        </div>
    `;
} else {
    displayQuiz(quiz);
}


// ========================================
// DISPLAY QUIZ
// ========================================

function displayQuiz(quiz) {

    quizContent.innerHTML = "";

    const form =
        document.createElement("form");

    form.id =
        "quizForm";

    quiz.questions.forEach(
        (item, index) => {

            const questionBox =
                document.createElement("div");

            questionBox.className =
                "question-box";

            questionBox.innerHTML = `
                <h3>
                    ${index + 1}.
                    ${escapeHTML(
                        item.question
                    )}
                </h3>
            `;

            item.options.forEach(
                (option, optionIndex) => {

                    const optionLabel =
                        document.createElement(
                            "label"
                        );

                    optionLabel.className =
                        "option";

                    optionLabel.innerHTML = `
                        <input
                            type="radio"
                            name="question${index}"
                            value="${optionIndex}"
                        >

                        <span>
                            ${escapeHTML(
                                option
                            )}
                        </span>
                    `;

                    questionBox.appendChild(
                        optionLabel
                    );
                }
            );

            form.appendChild(
                questionBox
            );
        }
    );


    const submitButton =
        document.createElement("button");

    submitButton.type =
        "submit";

    submitButton.id =
        "submitQuiz";

    submitButton.textContent =
        "✅ Submit Quiz";

    form.appendChild(
        submitButton
    );


    const resultDiv =
        document.createElement("div");

    resultDiv.id =
        "quizResult";

    form.appendChild(
        resultDiv
    );

    quizContent.appendChild(
        form
    );


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            checkAnswers(quiz);

        }
    );
}


// ========================================
// CHECK ANSWERS
// ========================================

async function checkAnswers(quiz) {

    let score = 0;

    let answered = 0;


    let resultHTML = `
        <div class="result-summary">
            <h2>
                🎉 Quiz Completed!
            </h2>
        </div>
    `;


    quiz.questions.forEach(
        (item, index) => {

            const selected =
                document.querySelector(
                    `input[name="question${index}"]:checked`
                );


            if (selected) {

                answered++;

                const userAnswer =
                    Number(
                        selected.value
                    );


                if (
                    userAnswer ===
                    item.answer
                ) {
                    score++;
                }

            }

        }
    );


    const totalQuestions =
        quiz.questions.length;


    const percentage =
        Math.round(
            (score / totalQuestions) * 100
        );


    resultHTML += `
        <div class="score">

            <h2>
                📊 Your Score:
                ${score}
                /
                ${totalQuestions}
            </h2>

            <p>
                Answered:
                ${answered}
                /
                ${totalQuestions}
            </p>

            <p>
                Percentage:
                ${percentage}%
            </p>

        </div>
    `;


    // ========================================
    // ANSWER REVIEW
    // ========================================

    quiz.questions.forEach(
        (item, index) => {

            const selected =
                document.querySelector(
                    `input[name="question${index}"]:checked`
                );


            const userAnswer =
                selected
                    ? Number(
                        selected.value
                    )
                    : -1;


            const isCorrect =
                userAnswer ===
                item.answer;


            resultHTML += `
                <div class="answer-review">

                    <h3>
                        Question
                        ${index + 1}
                    </h3>

                    <p>
                        ${escapeHTML(
                            item.question
                        )}
                    </p>

                    <p>
                        <strong>
                            Your Answer:
                        </strong>

                        ${
                            userAnswer >= 0
                            ? escapeHTML(
                                item.options[
                                    userAnswer
                                ]
                            )
                            : "Not answered"
                        }
                    </p>

                    <p>
                        <strong>
                            Correct Answer:
                        </strong>

                        ${escapeHTML(
                            item.options[
                                item.answer
                            ]
                        )}
                    </p>

                    <p
                        class="${
                            isCorrect
                                ? "correct"
                                : "incorrect"
                        }"
                    >
                        ${
                            isCorrect
                                ? "✅ Correct"
                                : "❌ Incorrect"
                        }
                    </p>

                </div>
            `;

        }
    );


    // ========================================
    // REVISION MESSAGE
    // ========================================

    resultHTML += `
        <div
            id="revisionMessage"
            class="revision-message"
        >
            ⏳ Creating your
            automatic revision schedule...
        </div>
    `;


    // ========================================
    // PROGRESS SAVE MESSAGE
    // ========================================

    resultHTML += `
        <div
            id="progressMessage"
            class="progress-message"
        >
            ⏳ Saving your quiz progress...
        </div>
    `;


    // ========================================
    // ANOTHER QUIZ BUTTON
    // ========================================

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
        document.getElementById(
            "quizResult"
        );


    resultDiv.innerHTML =
        resultHTML;


    // Disable answers

    document
        .querySelectorAll(
            "#quizForm input"
        )
        .forEach(
            input => {
                input.disabled =
                    true;
            }
        );


    document
        .getElementById(
            "submitQuiz"
        )
        .disabled = true;


    // ========================================
    // SAVE QUIZ PROGRESS
    // ========================================

    await saveQuizAttempt(
        quiz,
        score,
        totalQuestions
    );


    // ========================================
    // CREATE AUTOMATIC REVISION
    // ========================================

    await createAutomaticRevision(
        quiz,
        score,
        totalQuestions
    );


    // ========================================
    // ANOTHER QUIZ
    // ========================================

    document
        .getElementById(
            "anotherQuizBtn"
        )
        .addEventListener(
            "click",
            generateAnotherQuiz
        );
}


// ========================================
// SAVE QUIZ ATTEMPT
// ========================================

async function saveQuizAttempt(
    quiz,
    score,
    totalQuestions
) {

    const progressMessage =
        document.getElementById(
            "progressMessage"
        );


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        progressMessage.innerHTML = `
            ❌ Please login again
            to save your progress.
        `;

        return;

    }


    const topic =
        quiz.topic ||
        quiz.subject ||
        sessionStorage.getItem(
            "currentTopic"
        ) ||
        sessionStorage.getItem(
            "topic"
        ) ||
        "Current Learning Topic";


    const subject =
        quiz.subject ||
        sessionStorage.getItem(
            "currentSubject"
        ) ||
        "General";


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/quiz-attempts",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        subject,

                        topic,

                        score,

                        totalQuestions

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save quiz progress"
            );

        }


        progressMessage.innerHTML = `
            <div>

                📈
                <strong>
                    Quiz Progress Saved!
                </strong>

                <br><br>

                Your score has been added
                to your progress tracking.

            </div>
        `;

        progressMessage.style.color =
            "#4caf50";


        console.log(
            "Quiz attempt saved:",
            data
        );


    } catch (error) {

        console.error(
            "Save quiz attempt error:",
            error
        );


        progressMessage.innerHTML = `
            ❌ Quiz completed,
            but progress could not be saved.
        `;

        progressMessage.style.color =
            "red";

    }
}


// ========================================
// AUTOMATIC REVISION
// ========================================

async function createAutomaticRevision(
    quiz,
    score,
    totalQuestions
) {

    const revisionMessage =
        document.getElementById(
            "revisionMessage"
        );


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        revisionMessage.innerHTML = `
            ❌ Please login again
            to create revision.
        `;

        return;

    }


    const topic =
        quiz.topic ||
        quiz.subject ||
        sessionStorage.getItem(
            "currentTopic"
        ) ||
        sessionStorage.getItem(
            "topic"
        ) ||
        "Current Learning Topic";


    const subject =
        quiz.subject ||
        sessionStorage.getItem(
            "currentSubject"
        ) ||
        "General";


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/revisions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        subject,

                        topic,

                        score,

                        totalQuestions

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Revision creation failed"
            );

        }


        const revision =
            data.revision;


        revisionMessage.innerHTML = `
            <div>

                🧠
                <strong>
                    Automatic Revision Scheduled!
                </strong>

                <br><br>

                📊 Quiz Score:
                ${revision.score}
                /
                ${revision.totalQuestions}

                <br>

                📈 Percentage:
                ${revision.percentage}%

                <br>

                ⏰ Revise after:
                ${revision.intervalDays}
                day(s)

                <br>

                📅 Revision Date:
                ${revision.revisionDate}

            </div>
        `;


        revisionMessage.style.color =
            "#4caf50";


    } catch (error) {

        console.error(
            "Automatic revision error:",
            error
        );


        revisionMessage.innerHTML = `
            ❌ Quiz completed,
            but automatic revision
            could not be scheduled.
        `;

        revisionMessage.style.color =
            "red";

    }
}


// ========================================
// GENERATE ANOTHER QUIZ
// ========================================

async function generateAnotherQuiz() {

    const button =
        document.getElementById(
            "anotherQuizBtn"
        );


    button.disabled =
        true;


    button.textContent =
        "Generating New Quiz... ⏳";


    try {

        const generatedContent =
            sessionStorage.getItem(
                "generatedContent"
            );


        if (!generatedContent) {

            alert(
                "Please generate the study content again."
            );


            window.location.href =
                "mnemonic.html";


            return;

        }


        const previousQuestions =
            JSON.parse(
                sessionStorage.getItem(
                    "previousQuestions"
                ) || "[]"
            );


        const response =
            await fetch(
                "http://localhost:5000/api/quiz/generate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        content:
                            generatedContent,

                        previousQuestions:
                            previousQuestions

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "New quiz generation failed"
            );

        }


        sessionStorage.setItem(
            "generatedQuiz",
            JSON.stringify(
                data.quiz
            )
        );


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


        window.location.reload();


    } catch (error) {

        console.error(
            "Another Quiz Error:",
            error
        );


        alert(
            "❌ Failed to generate another quiz."
        );


        button.disabled =
            false;


        button.textContent =
            "🔄 Try Another Quiz";

    }
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}