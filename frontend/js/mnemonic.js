// ========================================
// ELEMENTS
// ========================================

const generateBtn =
    document.getElementById(
        "generateBtn"
    );


const topicInput =
    document.getElementById(
        "topic"
    );


const languageSelect =
    document.getElementById(
        "language"
    );


const typeSelect =
    document.getElementById(
        "type"
    );


const resultDiv =
    document.getElementById(
        "result"
    );


const loadingDiv =
    document.getElementById(
        "loading"
    );


const quizBtn =
    document.getElementById(
        "quizBtn"
    );


let generatedContent = "";


// ========================================
// LOAD CURRENT AI TUTOR TOPIC
// ========================================

const mnemonicTopic =
    localStorage.getItem(
        "mnemonicTopic"
    );


const mnemonicLanguage =
    localStorage.getItem(
        "mnemonicLanguage"
    );


if (mnemonicTopic) {

    topicInput.value =
        mnemonicTopic;

}


if (mnemonicLanguage) {

    if (
        [
            "English",
            "Tamil",
            "Bilingual"
        ].includes(
            mnemonicLanguage
        )
    ) {

        languageSelect.value =
            mnemonicLanguage;

    }

}


// ========================================
// GENERATE
// ========================================

generateBtn.addEventListener(
    "click",
    async function () {

        const topic =
            topicInput.value.trim();


        const language =
            languageSelect.value;


        const type =
            typeSelect.value;


        // ====================================
        // VALIDATION
        // ====================================

        if (!topic) {

            alert(
                "Please enter a topic!"
            );

            return;

        }


        // ====================================
        // RESET QUIZ DATA
        // ====================================

        quizBtn.style.display =
            "none";


        sessionStorage.removeItem(
            "generatedQuiz"
        );


        sessionStorage.removeItem(
            "previousQuestions"
        );


        sessionStorage.removeItem(
            "generatedContent"
        );


        // ====================================
        // SHOW LOADING
        // ====================================

        loadingDiv.style.display =
            "block";


        resultDiv.textContent =
            "";


        try {

            let endpoint;


            // ====================================
            // SELECT API
            // ====================================

            if (
                type === "mnemonic"
            ) {

                endpoint =
                    "http://localhost:5000/api/mnemonic/mnemonic";

            }

            else {

                endpoint =
                    "http://localhost:5000/api/mnemonic/story";

            }


            // ====================================
            // API REQUEST
            // ====================================

            const response =
                await fetch(
                    endpoint,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                topic:
                                    topic,

                                language:
                                    language

                            })

                    }
                );


            const data =
                await response.json();


            // ====================================
            // ERROR CHECK
            // ====================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Generation failed"
                );

            }


            // ====================================
            // STORE RESULT
            // ====================================

            if (
                type === "mnemonic"
            ) {

                generatedContent =
                    data.mnemonic;

            }

            else {

                generatedContent =
                    data.story;

            }


            // ====================================
            // DISPLAY RESULT
            // ====================================

            resultDiv.textContent =
                generatedContent;


            // ====================================
            // SAVE FOR QUIZ
            // ====================================

            if (generatedContent) {

                sessionStorage.setItem(
                    "generatedContent",
                    generatedContent
                );


                quizBtn.style.display =
                    "block";

            }


        }

        catch (error) {

            console.error(
                "Generation Error:",
                error
            );


            generatedContent =
                "";


            resultDiv.textContent =
                "❌ Failed to generate. Please make sure the backend server and Ollama are running.";

        }

        finally {

            loadingDiv.style.display =
                "none";

        }

    }
);


// ========================================
// QUIZ
// ========================================

quizBtn.addEventListener(
    "click",
    async function () {

        // ====================================
        // VALIDATION
        // ====================================

        if (!generatedContent) {

            alert(
                "Please generate a mnemonic or story first!"
            );

            return;

        }


        try {

            quizBtn.disabled =
                true;


            quizBtn.textContent =
                "Generating Quiz... ⏳";


            // ====================================
            // PREVIOUS QUESTIONS
            // ====================================

            const previousQuestions =
                JSON.parse(
                    sessionStorage.getItem(
                        "previousQuestions"
                    ) || "[]"
                );


            // ====================================
            // QUIZ API
            // ====================================

            const response =
                await fetch(
                    "http://localhost:5000/api/quiz/generate",
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


            // ====================================
            // ERROR CHECK
            // ====================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Quiz generation failed"
                );

            }


            // ====================================
            // SAVE QUIZ
            // ====================================

            sessionStorage.setItem(
                "generatedQuiz",
                JSON.stringify(
                    data.quiz
                )
            );


            // ====================================
            // SAVE QUESTIONS
            // ====================================

            const newQuestions =
                data.quiz.questions.map(
                    question =>
                        question.question
                );


            sessionStorage.setItem(
                "previousQuestions",
                JSON.stringify(
                    [
                        ...previousQuestions,
                        ...newQuestions
                    ]
                )
            );


            // ====================================
            // GO TO QUIZ
            // ====================================

            window.location.href =
                "quiz.html";


        }

        catch (error) {

            console.error(
                "Quiz Error:",
                error
            );


            alert(
                "❌ Failed to generate quiz. Please make sure the backend server and Ollama are running."
            );

        }

        finally {

            quizBtn.disabled =
                false;


            quizBtn.textContent =
                "🎯 Take Quiz";

        }

    }
);


// ========================================
// BACK TO DASHBOARD
// ========================================

function goDashboard() {

    window.location.href =
        "dashboard.html";

}