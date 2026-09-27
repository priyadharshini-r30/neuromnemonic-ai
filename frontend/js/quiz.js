// ========================================
// NEUROMNEMONIC AI - QUIZ JS
// ========================================

const API_URL =
    "http://localhost:5000";

const quizContent =
    document.getElementById("quizContent");

const quizData =
    sessionStorage.getItem("generatedQuiz");

console.log("Quiz data:", quizData);

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



// ========================================
// CHECK QUIZ
// ========================================

if (
    !quiz ||
    !quiz.questions ||
    quiz.questions.length === 0
) {

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



// ========================================
// DISPLAY QUIZ
// ========================================

function displayQuiz(quiz) {

    quizContent.innerHTML = "";

    const form =
        document.createElement("form");

    form.id = "quizForm";


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
                            ${escapeHTML(option)}
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



    // ========================================
    // SUBMIT BUTTON
    // ========================================

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



    // ========================================
    // RESULT DIV
    // ========================================

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



    // ========================================
    // SUBMIT EVENT
    // ========================================

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



    // ========================================
    // CALCULATE SCORE
    // ========================================

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



    // ========================================
    // SCORE
    // ========================================

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
                        Question ${index + 1}
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

                    <p class="${
                        isCorrect
                            ? "correct"
                            : "incorrect"
                    }">

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

            ⏳ Creating your automatic
            revision schedule...

        </div>
    `;



    // ========================================
    // PROGRESS MESSAGE
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
    // NEXT TOPIC AREA
    // ========================================

    resultHTML += `
        <div
            id="nextTopicArea"
            class="next-topic-area"
        >

            <p>
                ⏳ Updating your learning roadmap...
            </p>

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



    // ========================================
    // DISABLE ANSWERS
    // ========================================

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
        .disabled =
            true;



    // ========================================
    // SAVE QUIZ PROGRESS
    // ========================================

    await saveQuizAttempt(
        quiz,
        score,
        totalQuestions
    );



    // ========================================
    // CREATE REVISION
    // ========================================

    await createAutomaticRevision(
        quiz,
        score,
        totalQuestions
    );



    // ========================================
    // COMPLETE CURRENT ROADMAP TOPIC
    // ========================================

    await completeCurrentTopic();



    // ========================================
    // ANOTHER QUIZ
    // ========================================

    const anotherQuizBtn =
        document.getElementById(
            "anotherQuizBtn"
        );


    if (anotherQuizBtn) {

        anotherQuizBtn.addEventListener(
            "click",
            generateAnotherQuiz
        );

    }

}



// ========================================
// COMPLETE CURRENT ROADMAP TOPIC
// ========================================

async function completeCurrentTopic() {

    const nextTopicArea =
        document.getElementById(
            "nextTopicArea"
        );


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        nextTopicArea.innerHTML = `
            <p>
                ❌ Please login again to update
                your roadmap.
            </p>
        `;

        return;

    }



    try {

        // ========================================
        // GET ALL ROADMAPS
        // ========================================

        const response =
            await fetch(
                API_URL +
                "/api/roadmaps",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load roadmap"
            );

        }


        const roadmaps =
            data.roadmaps || [];


        if (
            !Array.isArray(roadmaps) ||
            roadmaps.length === 0
        ) {

            showNoRoadmapMessage();

            return;

        }



        // ========================================
        // GET CURRENT TOPIC
        // ========================================

        const currentTopic =
            getCurrentTopic();


        console.log(
            "Current learning topic:",
            currentTopic
        );



        // ========================================
        // FIND ACTIVE ROADMAP
        // ========================================

        const roadmap =
            findActiveRoadmap(
                roadmaps,
                currentTopic
            );


        if (!roadmap) {

            console.warn(
                "Active roadmap not found"
            );

            showNoRoadmapMessage();

            return;

        }



        // ========================================
        // FIND CURRENT DAY
        // ========================================

        let currentIndex =
            findCurrentTopicIndex(
                roadmap,
                currentTopic
            );



        // ========================================
        // FALLBACK
        // ========================================

        if (currentIndex === -1) {

            currentIndex =
                findFirstIncompleteIndex(
                    roadmap
                );

        }


        if (currentIndex === -1) {

            showRoadmapCompleted();

            return;

        }



        // ========================================
        // MARK CURRENT TOPIC COMPLETED
        // ========================================

        roadmap.roadmap[
            currentIndex
        ].completed = true;



        // ========================================
        // SAVE COMPLETION TO SERVER
        // ========================================

        await updateRoadmapCompletion(
            roadmap._id,
            currentIndex,
            token
        );



        // ========================================
        // FIND NEXT TOPIC
        // ========================================

        const nextIndex =
            findNextIncompleteIndex(
                roadmap,
                currentIndex
            );



        // ========================================
        // NO NEXT TOPIC
        // ========================================

        if (nextIndex === -1) {

            showRoadmapCompleted();

            return;

        }



        const nextTopic =
            roadmap.roadmap[
                nextIndex
            ];



        // ========================================
        // SAVE NEXT TOPIC
        // ========================================

        localStorage.setItem(
            "currentLearningDay",
            String(
                nextTopic.day
            )
        );


        localStorage.setItem(
            "currentLearningTopic",
            nextTopic.topic
        );


        localStorage.setItem(
            "currentLearningDescription",
            nextTopic.description || ""
        );


        sessionStorage.setItem(
            "currentTopic",
            nextTopic.topic
        );


        sessionStorage.removeItem(
            "generatedContent"
        );


        sessionStorage.removeItem(
            "generatedQuiz"
        );



        // ========================================
        // SHOW NEXT TOPIC BUTTON
        // ========================================

        nextTopicArea.innerHTML = `

            <div class="next-topic-card">

                <h2>
                    📚 Topic Completed!
                </h2>

                <p>
                    Great work! You completed:
                </p>

                <strong>
                    ${escapeHTML(
                        roadmap.roadmap[
                            currentIndex
                        ].topic
                    )}
                </strong>

                <p>
                    Next topic:
                </p>

                <h3>
                    ${escapeHTML(
                        nextTopic.topic
                    )}
                </h3>

                <button
                    type="button"
                    id="nextTopicBtn"
                >
                    🏠 Go to Dashboard
                </button>

            </div>

        `;



        // ========================================
        // NEXT TOPIC CLICK
        // ========================================

        document
            .getElementById(
                "nextTopicBtn"
            )
            .addEventListener(
                "click",
                function () {

                    // IMPORTANT:
                    // Go to Dashboard instead
                    // of opening AI Tutor directly.

                    window.location.href =
                        "dashboard.html";

                }
            );



    } catch (error) {

        console.error(
            "Roadmap completion error:",
            error
        );


        nextTopicArea.innerHTML = `

            <div>

                <p>
                    ⚠️ Quiz completed successfully,
                    but the roadmap could not be updated.
                </p>

                <button
                    type="button"
                    id="retryRoadmapBtn"
                >
                    🔄 Continue
                </button>

            </div>

        `;


        document
            .getElementById(
                "retryRoadmapBtn"
            )
            .addEventListener(
                "click",
                function () {

                    window.location.href =
                        "dashboard.html";

                }
            );

    }

}



// ========================================
// GET CURRENT TOPIC
// ========================================

function getCurrentTopic() {

    return (

        localStorage.getItem(
            "currentLearningTopic"
        ) ||

        sessionStorage.getItem(
            "currentTopic"
        ) ||

        quiz?.topic ||

        quiz?.subject ||

        ""

    ).trim();

}



// ========================================
// FIND ACTIVE ROADMAP
// ========================================

function findActiveRoadmap(
    roadmaps,
    currentTopic
) {

    // First try to find roadmap
    // containing current topic

    for (
        const roadmap of roadmaps
    ) {

        if (
            !Array.isArray(
                roadmap.roadmap
            )
        ) {

            continue;

        }


        const found =
            roadmap.roadmap.some(
                item =>
                    normalizeText(
                        item.topic
                    ) ===
                    normalizeText(
                        currentTopic
                    )
            );


        if (found) {

            return roadmap;

        }

    }



    // Fallback:
    // latest roadmap

    return roadmaps[0] || null;

}



// ========================================
// FIND CURRENT TOPIC INDEX
// ========================================

function findCurrentTopicIndex(
    roadmap,
    currentTopic
) {

    if (
        !Array.isArray(
            roadmap.roadmap
        )
    ) {

        return -1;

    }


    return roadmap.roadmap.findIndex(
        item =>
            normalizeText(
                item.topic
            ) ===
            normalizeText(
                currentTopic
            )
    );

}



// ========================================
// FIND FIRST INCOMPLETE
// ========================================

function findFirstIncompleteIndex(
    roadmap
) {

    return roadmap.roadmap.findIndex(
        item =>
            item.completed !== true
    );

}



// ========================================
// FIND NEXT INCOMPLETE
// ========================================

function findNextIncompleteIndex(
    roadmap,
    currentIndex
) {

    for (
        let i = currentIndex + 1;
        i < roadmap.roadmap.length;
        i++
    ) {

        if (
            roadmap.roadmap[i].completed !== true
        ) {

            return i;

        }

    }


    return -1;

}



// ========================================
// UPDATE ROADMAP COMPLETION
// ========================================

async function updateRoadmapCompletion(
    roadmapId,
    topicIndex,
    token
) {

    const response =
        await fetch(
            API_URL +
            "/api/roadmaps/" +
            roadmapId +
            "/complete",
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " +
                        token

                },

                body:
                    JSON.stringify({

                        topicIndex:
                            topicIndex

                    })

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to update roadmap"
        );

    }


    console.log(
        "Roadmap completion saved:",
        data
    );

}



// ========================================
// ROADMAP COMPLETED
// ========================================

function showRoadmapCompleted() {

    const nextTopicArea =
        document.getElementById(
            "nextTopicArea"
        );


    nextTopicArea.innerHTML = `

        <div class="roadmap-completed-card">

            <h2>
                🎉 Roadmap Completed!
            </h2>

            <p>
                You have completed all the
                topics in this learning roadmap.
            </p>

            <p>
                Excellent work! Keep revising
                and practicing.
            </p>

            <button
                type="button"
                id="dashboardBtn"
            >
                🏠 Go to Dashboard
            </button>

        </div>

    `;


    document
        .getElementById(
            "dashboardBtn"
        )
        .addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";

            }
        );

}



// ========================================
// NO ROADMAP MESSAGE
// ========================================

function showNoRoadmapMessage() {

    const nextTopicArea =
        document.getElementById(
            "nextTopicArea"
        );


    nextTopicArea.innerHTML = `

        <div>

            <p>
                ⚠️ Roadmap information was not found.
            </p>

            <button
                type="button"
                id="backTutorBtn"
            >
                ← Back to AI Tutor
            </button>

        </div>

    `;


    document
        .getElementById(
            "backTutorBtn"
        )
        .addEventListener(
            "click",
            function () {

                window.location.href =
                    "ai-tutor.html";

            }
        );

}



// ========================================
// NORMALIZE TEXT
// ========================================

function normalizeText(text) {

    return String(text || "")
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
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
        localStorage.getItem(
            "currentLearningTopic"
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
                API_URL +
                "/api/quiz-attempts",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token

                    },

                    body:
                        JSON.stringify({

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
        localStorage.getItem(
            "currentLearningTopic"
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
                API_URL +
                "/api/revisions",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token

                    },

                    body:
                        JSON.stringify({

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
                API_URL +
                "/api/quiz/generate",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

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