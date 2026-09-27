const API_URL =
    "http://localhost:5000";


// ========================================
// GET ELEMENTS
// ========================================

const input =
    document.getElementById("questionInput");

const chatBox =
    document.getElementById("chatBox");

const sendButton =
    document.getElementById("sendButton");

const currentTopic =
    document.getElementById("currentTopic");

const currentTopicDescription =
    document.getElementById("currentTopicDescription");

const mnemonicButton =
    document.getElementById("mnemonicButton");

const quizButton =
    document.getElementById("quizButton");

const completeButton =
    document.getElementById("completeButton");


// ========================================
// GET TOKEN
// ========================================

const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "login.html";
}


// ========================================
// CURRENT ROADMAP DATA
// ========================================

const roadmapId =
    localStorage.getItem(
        "currentRoadmapId"
    );

const learningDay =
    localStorage.getItem(
        "currentLearningDay"
    );

const learningTopic =
    localStorage.getItem(
        "currentLearningTopic"
    );

const learningDescription =
    localStorage.getItem(
        "currentLearningDescription"
    ) || "";

const learningLanguage =
    localStorage.getItem(
        "currentLearningLanguage"
    ) || "English";

const learningLevel =
    localStorage.getItem(
        "currentLearningLevel"
    ) || "Beginner";


// ========================================
// CHECK CURRENT TOPIC
// ========================================

if (!roadmapId || !learningTopic) {

    if (currentTopic) {

        currentTopic.textContent =
            "No learning topic selected";
    }

    if (currentTopicDescription) {

        currentTopicDescription.textContent =
            "Please open your personalized roadmap and select a topic.";
    }

    if (completeButton) {
        completeButton.disabled = true;
    }

    if (mnemonicButton) {
        mnemonicButton.disabled = true;
    }

    if (quizButton) {
        quizButton.disabled = true;
    }
}


// ========================================
// DISPLAY CURRENT TOPIC
// ========================================

if (learningTopic && currentTopic) {

    currentTopic.textContent =
        learningTopic;
}


if (
    learningDescription &&
    currentTopicDescription
) {

    currentTopicDescription.textContent =
        learningDescription;
}


// ========================================
// ADD MESSAGE
// ========================================

function addMessage(
    sender,
    message,
    type
) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "message " + type;


    const strong =
        document.createElement("strong");

    strong.textContent =
        sender + ":";


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        message;


    messageDiv.appendChild(
        strong
    );

    messageDiv.appendChild(
        paragraph
    );


    chatBox.appendChild(
        messageDiv
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// ========================================
// ASK AI
// ========================================

async function askAI() {

    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    addMessage(
        "You",
        message,
        "user-message"
    );


    input.value = "";

    sendButton.disabled =
        true;


    const loadingMessage =
        document.createElement("div");


    loadingMessage.className =
        "message ai-message";


    loadingMessage.innerHTML = `
        <strong>AI Tutor:</strong>
        <p>Thinking... 🤔</p>
    `;


    chatBox.appendChild(
        loadingMessage
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;


    try {

        const personalizedQuestion = `

You are teaching a student using NeuroMnemonic AI.

Current roadmap day:
${learningDay || "Not specified"}

Current learning topic:
${learningTopic}

Topic description:
${learningDescription}

Learning level:
${learningLevel}

Preferred language:
${learningLanguage}

Student question:
${message}

Explain the answer according to the student's
current topic and learning level.

Teach clearly and simply.

Do not unnecessarily change the topic.

If the student asks for a simpler explanation,
give a simpler explanation.

If the student asks for an example,
give a relevant example.

Use the selected language:
${learningLanguage}
`;


        const response =
            await fetch(
                API_URL +
                "/api/ai/ask",
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

                            question:
                                personalizedQuestion
                        })
                }
            );


        const data =
            await response.json();


        loadingMessage.remove();


        if (
            response.ok &&
            data.success
        ) {

            addMessage(
                "AI Tutor",
                data.reply,
                "ai-message"
            );

        }

        else {

            addMessage(
                "AI Tutor",
                data.message ||
                "Sorry, I couldn't answer that.",
                "ai-message"
            );
        }


    }

    catch (error) {

        console.error(
            "AI Request Error:",
            error
        );


        loadingMessage.remove();


        addMessage(
            "AI Tutor",
            "Sorry 😕 I couldn't connect to the AI Tutor.",
            "ai-message"
        );

    }

    finally {

        sendButton.disabled =
            false;

        input.focus();
    }
}


// ========================================
// SEND BUTTON
// ========================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        askAI
    );
}


// ========================================
// ENTER KEY
// ========================================

if (input) {

    input.addEventListener(
        "keypress",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                askAI();
            }

        }
    );
}


// ========================================
// MNEMONIC / STORY
// ========================================

if (mnemonicButton) {

    mnemonicButton.addEventListener(
        "click",
        function () {

            if (!learningTopic) {

                alert(
                    "No learning topic selected."
                );

                return;
            }


            localStorage.setItem(
                "mnemonicTopic",
                learningTopic
            );


            localStorage.setItem(
                "mnemonicLanguage",
                learningLanguage
            );


            localStorage.setItem(
                "mnemonicRoadmapId",
                roadmapId || ""
            );


            localStorage.setItem(
                "mnemonicDay",
                learningDay || ""
            );


            window.location.href =
                "mnemonic.html";
        }
    );
}


// ========================================
// TAKE QUIZ
// ========================================

if (quizButton) {

    quizButton.addEventListener(
        "click",
        generateQuiz
    );
}


// ========================================
// GENERATE QUIZ
// ========================================

async function generateQuiz() {

    if (!learningTopic) {

        alert(
            "No learning topic selected."
        );

        return;
    }


    try {

        quizButton.disabled =
            true;

        quizButton.textContent =
            "Generating Quiz... ⏳";


        const quizContent = `

Topic:
${learningTopic}

Description:
${learningDescription}

Generate questions only from this topic.

The student is currently learning this topic
at ${learningLevel} level.

`;


        const response =
            await fetch(
                API_URL +
                "/api/quiz/generate",
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

                            content:
                                quizContent,

                            previousQuestions:
                                []
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Quiz generation failed"
            );
        }


        if (!data.quiz) {

            throw new Error(
                "Quiz was not generated"
            );
        }


        sessionStorage.setItem(
            "generatedQuiz",
            JSON.stringify(
                data.quiz
            )
        );


        sessionStorage.removeItem(
            "previousQuestions"
        );


        sessionStorage.setItem(
            "quizTopic",
            learningTopic
        );


        sessionStorage.setItem(
            "quizDay",
            learningDay || ""
        );


        window.location.href =
            "quiz.html";


    }

    catch (error) {

        console.error(
            "Quiz Error:",
            error
        );


        alert(
            "❌ Failed to generate quiz. Please make sure Ollama and backend are running."
        );

    }

    finally {

        quizButton.disabled =
            false;

        quizButton.textContent =
            "🎯 Take Quiz";
    }
}


// ========================================
// COMPLETE STUDY
// ========================================

if (completeButton) {

    completeButton.addEventListener(
        "click",
        completeStudy
    );
}


// ========================================
// COMPLETE CURRENT TOPIC
// ========================================

async function completeStudy() {

    if (
        !roadmapId ||
        !learningDay
    ) {

        alert(
            "Roadmap information is missing. Please open the roadmap again."
        );

        return;
    }


    const confirmComplete =
        confirm(
            "Have you completed studying this topic?"
        );


    if (!confirmComplete) {
        return;
    }


    try {

        completeButton.disabled =
            true;

        completeButton.textContent =
            "Saving... ⏳";


        // ========================================
        // CONVERT DAY NUMBER TO ARRAY INDEX
        // Day 1 -> index 0
        // Day 2 -> index 1
        // ========================================

        const topicIndex =
            Number(learningDay) - 1;


        if (
            !Number.isInteger(topicIndex) ||
            topicIndex < 0
        ) {

            throw new Error(
                "Invalid learning day."
            );
        }


        // ========================================
        // MARK CURRENT DAY COMPLETED
        // ========================================

        const response =
            await fetch(

                API_URL +
                `/api/roadmaps/${roadmapId}/complete`,

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
                "Failed to complete topic"
            );
        }


        // ========================================
        // ENTIRE ROADMAP COMPLETED
        // ========================================

        if (
            data.progress &&
            data.progress.allCompleted
        ) {

            alert(
                "🎉 Congratulations! You completed the entire roadmap!"
            );


            localStorage.removeItem(
                "currentLearningDay"
            );

            localStorage.removeItem(
                "currentLearningTopic"
            );

            localStorage.removeItem(
                "currentLearningDescription"
            );


            window.location.href =
                "roadmap.html";


            return;
        }


        // ========================================
        // NEXT TOPIC
        // ========================================

        if (data.nextDay) {

            localStorage.setItem(
                "currentLearningDay",
                String(
                    data.nextDay.day
                )
            );


            localStorage.setItem(
                "currentLearningTopic",
                data.nextDay.topic
            );


            localStorage.setItem(
                "currentLearningDescription",
                data.nextDay.description || ""
            );


            alert(
                `✅ Day ${learningDay} completed!\n\nNext topic: ${data.nextDay.topic}`
            );


            window.location.reload();


            return;
        }


        // ========================================
        // FALLBACK
        // ========================================

        alert(
            "✅ Topic completed successfully."
        );


        window.location.href =
            "roadmap.html";


    }

    catch (error) {

        console.error(
            "Complete Study Error:",
            error
        );


        alert(
            "❌ Could not save completion. Please try again."
        );

    }

    finally {

        completeButton.disabled =
            false;

        completeButton.textContent =
            "✅ Complete Study";
    }
}
// ========================================
// BACK TO DASHBOARD
// ========================================

const backDashboardBtn =
    document.getElementById("backDashboardBtn");

if (backDashboardBtn) {

    backDashboardBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "dashboard.html";

        }
    );

}