const API_URL = "http://localhost:5000";

// ========================================
// GET HTML ELEMENTS
// ========================================

const topicInput =
    document.getElementById("topic");

const languageSelect =
    document.getElementById("language");

const levelSelect =
    document.getElementById("level");

const durationInput =
    document.getElementById("duration");

const generateRoadmapBtn =
    document.getElementById("generateRoadmapBtn");

const loading =
    document.getElementById("loading");

const resultSection =
    document.getElementById("resultSection");

const resultContent =
    document.getElementById("resultContent");

const backDashboardBtn =
    document.getElementById("backDashboardBtn");


// ========================================
// GET LOGIN TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("token");
}


// ========================================
// CHECK LOGIN
// ========================================

const token = getToken();

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// SAVED GOAL
// ========================================

let savedGoal = null;


// ========================================
// LOAD SAVED GOAL
// ========================================

async function loadGoal() {

    try {

        const response =
            await fetch(
                API_URL + "/api/goals",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.warn(
                "Goal not found:",
                data.message
            );

            return;
        }


        savedGoal = data;


        // ========================================
        // CREATE GOAL SUMMARY
        // ========================================

        createGoalSummary(data);


        // ========================================
        // FILL ROADMAP INPUTS
        // ========================================

        fillRoadmapInputs(data);


    } catch (error) {

        console.error(
            "Goal Load Error:",
            error
        );
    }
}


// ========================================
// CREATE GOAL SUMMARY
// ========================================

function createGoalSummary(goal) {

    const welcomeSection =
        document.querySelector(
            ".welcome-section"
        );


    if (!welcomeSection) {
        return;
    }


    // Remove old summary
    const oldSummary =
        document.getElementById(
            "goalSummary"
        );


    if (oldSummary) {
        oldSummary.remove();
    }


    const summary =
        document.createElement("div");


    summary.id =
        "goalSummary";


    summary.style.marginTop =
        "20px";


    summary.style.padding =
        "18px";


    summary.style.border =
        "1px solid #e5e7eb";


    summary.style.borderRadius =
        "12px";


    summary.style.background =
        "#ffffff";


    // ========================================
    // TITLE
    // ========================================

    const title =
        document.createElement("h3");


    title.textContent =
        "🎯 Your Selected Goals";


    title.style.marginBottom =
        "12px";


    title.style.color =
        "#111827";


    // ========================================
    // DETAILS
    // ========================================

    const details =
        document.createElement("div");


    details.style.lineHeight =
        "1.8";


    details.style.color =
        "#4b5563";


    // ========================================
    // NORMALIZE GOAL TYPE
    // ========================================

    let goalTypes = [];


    if (Array.isArray(goal.goalType)) {

        goalTypes =
            goal.goalType;

    } else if (goal.goalType) {

        // Supports old saved data
        goalTypes =
            [goal.goalType];
    }


    // ========================================
    // ACADEMIC DETAILS
    // ========================================

    let academicHTML = "";


    if (
        goalTypes.includes("Academic")
    ) {

        academicHTML = `
            <div style="margin-bottom: 14px;">
                <strong>🎓 Academic / College</strong><br>

                Course:
                ${escapeHTML(
                    goal.course ||
                    "Not specified"
                )}
                <br>

                Semester:
                ${escapeHTML(
                    goal.semester ||
                    "Not specified"
                )}
                <br>

                Subjects:
                ${escapeHTML(
                    goal.subjects &&
                    goal.subjects.length
                        ? goal.subjects.join(", ")
                        : "Not specified"
                )}
            </div>
        `;
    }


    // ========================================
    // COMPETITIVE DETAILS
    // ========================================

    let competitiveHTML = "";


    if (
        goalTypes.includes(
            "Competitive Exam"
        )
    ) {

        competitiveHTML = `
            <div style="margin-bottom: 14px;">
                <strong>🏆 Competitive Exam</strong><br>

                Exam:
                ${escapeHTML(
                    goal.examName ||
                    "Not specified"
                )}
                <br>

                Group / Level:
                ${escapeHTML(
                    goal.examGroup ||
                    "Not specified"
                )}
                <br>

                Preparation Level:
                ${escapeHTML(
                    goal.preparationLevel ||
                    "Not specified"
                )}
                <br>

                Target Attempt:
                ${escapeHTML(
                    goal.targetAttempt ||
                    "Not specified"
                )}
            </div>
        `;
    }


    // ========================================
    // BOTH GOALS
    // ========================================

    details.innerHTML =
        academicHTML +
        competitiveHTML +
        `
            <div>
                <strong>⏰ Daily Study Time:</strong>
                ${escapeHTML(
                    String(
                        goal.dailyStudyHours ||
                        0
                    )
                )}
                hours
            </div>
        `;


    summary.appendChild(
        title
    );


    summary.appendChild(
        details
    );


    welcomeSection.appendChild(
        summary
    );
}


// ========================================
// FILL ROADMAP INPUTS
// ========================================

function fillRoadmapInputs(goal) {

    // ========================================
    // NORMALIZE GOAL TYPE
    // ========================================

    let goalTypes = [];


    if (Array.isArray(goal.goalType)) {

        goalTypes =
            goal.goalType;

    } else if (goal.goalType) {

        goalTypes =
            [goal.goalType];
    }


    const hasAcademic =
        goalTypes.includes(
            "Academic"
        );


    const hasCompetitive =
        goalTypes.includes(
            "Competitive Exam"
        );


    // ========================================
    // ACADEMIC ONLY
    // ========================================

    if (
        hasAcademic &&
        !hasCompetitive
    ) {

        if (
            Array.isArray(
                goal.subjects
            ) &&
            goal.subjects.length > 0
        ) {

            topicInput.value =
                goal.subjects.join(", ");
        }


        languageSelect.value =
            "English";


        levelSelect.value =
            "Beginner";


        if (
            !durationInput.value
        ) {

            durationInput.value =
                "7";
        }

        return;
    }


    // ========================================
    // COMPETITIVE ONLY
    // ========================================

    if (
        hasCompetitive &&
        !hasAcademic
    ) {

        let topic = "";


        if (goal.examName) {

            topic +=
                goal.examName;
        }


        if (goal.examGroup) {

            if (topic) {

                topic +=
                    " - ";
            }


            topic +=
                goal.examGroup;
        }


        topicInput.value =
            topic;


        if (
            goal.preparationLevel
        ) {

            levelSelect.value =
                goal.preparationLevel;
        } else {

            levelSelect.value =
                "Beginner";
        }


        languageSelect.value =
            "English";


        if (
            !durationInput.value
        ) {

            durationInput.value =
                "7";
        }


        return;
    }


    // ========================================
    // BOTH GOALS
    // ========================================

    if (
        hasAcademic &&
        hasCompetitive
    ) {

        let combinedTopic = "";


        // Academic subjects
        if (
            Array.isArray(
                goal.subjects
            ) &&
            goal.subjects.length > 0
        ) {

            combinedTopic +=
                "Academic Subjects: " +
                goal.subjects.join(", ");
        }


        // Competitive exam
        if (
            goal.examName ||
            goal.examGroup
        ) {

            if (
                combinedTopic
            ) {

                combinedTopic +=
                    " | ";
            }


            combinedTopic +=
                "Competitive Exam: ";


            if (
                goal.examName
            ) {

                combinedTopic +=
                    goal.examName;
            }


            if (
                goal.examGroup
            ) {

                combinedTopic +=
                    " - " +
                    goal.examGroup;
            }
        }


        topicInput.value =
            combinedTopic;


        // Use competitive preparation level
        if (
            goal.preparationLevel
        ) {

            levelSelect.value =
                goal.preparationLevel;

        } else {

            levelSelect.value =
                "Beginner";
        }


        languageSelect.value =
            "English";


        if (
            !durationInput.value
        ) {

            durationInput.value =
                "7";
        }
    }
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ========================================
// SHOW LOADING
// ========================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );


    resultSection.classList.add(
        "hidden"
    );


    generateRoadmapBtn.disabled =
        true;
}


// ========================================
// HIDE LOADING
// ========================================

function hideLoading() {

    loading.classList.add(
        "hidden"
    );


    generateRoadmapBtn.disabled =
        false;
}


// ========================================
// DISPLAY ROADMAP
// ========================================

function displayRoadmap(
    roadmapData
) {

    resultContent.innerHTML =
        "";


    const journey =
        document.createElement(
            "div"
        );


    journey.className =
        "learning-journey";


    // ========================================
    // HEADER
    // ========================================

    const journeyHeader =
        document.createElement(
            "div"
        );


    journeyHeader.className =
        "journey-header";


    const journeyIcon =
        document.createElement(
            "div"
        );


    journeyIcon.className =
        "journey-icon";


    journeyIcon.textContent =
        "🗺️";


    const journeyText =
        document.createElement(
            "div"
        );


    const journeyTitle =
        document.createElement(
            "h2"
        );


    journeyTitle.textContent =
        "Your Learning Journey";


    const journeySubtitle =
        document.createElement(
            "p"
        );


    journeySubtitle.textContent =
        roadmapData.length +
        " days personalized for you";


    journeyText.appendChild(
        journeyTitle
    );


    journeyText.appendChild(
        journeySubtitle
    );


    journeyHeader.appendChild(
        journeyIcon
    );


    journeyHeader.appendChild(
        journeyText
    );


    journey.appendChild(
        journeyHeader
    );


    // ========================================
    // EACH DAY
    // ========================================

    roadmapData.forEach(
        function (
            day,
            index
        ) {

            const dayWrapper =
                document.createElement(
                    "div"
                );


            dayWrapper.className =
                "journey-day";


            // ========================================
            // DAY NUMBER
            // ========================================

            const dayNumber =
                document.createElement(
                    "div"
                );


            dayNumber.className =
                "day-number";


            dayNumber.textContent =
                String(
                    day.day
                ).padStart(
                    2,
                    "0"
                );


            // ========================================
            // CARD
            // ========================================

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "journey-card";


            // ========================================
            // CARD TOP
            // ========================================

            const cardTop =
                document.createElement(
                    "div"
                );


            cardTop.className =
                "journey-card-top";


            const dayLabel =
                document.createElement(
                    "span"
                );


            dayLabel.className =
                "day-label";


            dayLabel.textContent =
                "DAY " +
                String(
                    day.day
                ).padStart(
                    2,
                    "0"
                );


            const status =
                document.createElement(
                    "span"
                );


            status.className =
                day.completed
                    ? "status completed"
                    : "status pending";


            status.textContent =
                day.completed
                    ? "✓ Completed"
                    : "⏳ Not Completed";


            cardTop.appendChild(
                dayLabel
            );


            cardTop.appendChild(
                status
            );


            // ========================================
            // TOPIC
            // ========================================

            const topic =
                document.createElement(
                    "h3"
                );


            topic.textContent =
                day.topic;


            // ========================================
            // DESCRIPTION
            // ========================================

            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                day.description ||
                "Study this topic and practice the important concepts.";


            // ========================================
            // FOOTER
            // ========================================

            const footer =
                document.createElement(
                    "div"
                );


            footer.className =
                "journey-footer";


            const footerText =
                document.createElement(
                    "span"
                );


            footerText.textContent =
                day.completed
                    ? "🎉 Great work!"
                    : "📖 Keep learning";


            footer.appendChild(
                footerText
            );


            // ========================================
            // BUILD CARD
            // ========================================

            card.appendChild(
                cardTop
            );


            card.appendChild(
                topic
            );


            card.appendChild(
                description
            );


            card.appendChild(
                footer
            );


            // ========================================
            // BUILD DAY
            // ========================================

            dayWrapper.appendChild(
                dayNumber
            );


            dayWrapper.appendChild(
                card
            );


            journey.appendChild(
                dayWrapper
            );


            // ========================================
            // CONNECTOR
            // ========================================

            if (
                index <
                roadmapData.length - 1
            ) {

                const line =
                    document.createElement(
                        "div"
                    );


                line.className =
                    "journey-line";


                journey.appendChild(
                    line
                );
            }
        }
    );


    resultContent.appendChild(
        journey
    );


    // ========================================
    // START LEARNING BUTTON
    // ========================================

    const startLearningArea =
        document.createElement(
            "div"
        );


    startLearningArea.style.textAlign =
        "center";


    startLearningArea.style.marginTop =
        "30px";


    const startLearningBtn =
        document.createElement(
            "button"
        );


    startLearningBtn.type =
        "button";


    startLearningBtn.textContent =
        "🚀 Start Learning";


    startLearningBtn.style.border =
        "none";


    startLearningBtn.style.padding =
        "13px 28px";


    startLearningBtn.style.borderRadius =
        "8px";


    startLearningBtn.style.background =
        "#2563eb";


    startLearningBtn.style.color =
        "#ffffff";


    startLearningBtn.style.cursor =
        "pointer";


    startLearningBtn.style.fontSize =
        "15px";


    startLearningBtn.style.fontWeight =
        "600";


    startLearningBtn.addEventListener(
        "click",
        function () {

            localStorage.setItem(
                "currentLearningTopic",
                topicInput.value.trim()
            );


            window.location.href =
                "ai-tutor.html";
        }
    );


    startLearningArea.appendChild(
        startLearningBtn
    );


    resultContent.appendChild(
        startLearningArea
    );


    // ========================================
    // SHOW RESULT
    // ========================================

    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ========================================
// GENERATE ROADMAP
// ========================================

async function generateRoadmap() {

    const topic =
        topicInput.value.trim();


    const preferredLanguage =
        languageSelect.value;


    const learningLevel =
        levelSelect.value;


    const duration =
        parseInt(
            durationInput.value,
            10
        );


    // ========================================
    // VALIDATE TOPIC
    // ========================================

    if (!topic) {

        alert(
            "Please enter a topic you want to learn."
        );


        topicInput.focus();


        return;
    }


    // ========================================
    // VALIDATE DAYS
    // ========================================

    if (
        isNaN(duration) ||
        duration < 1
    ) {

        alert(
            "Please enter your available study days."
        );


        durationInput.focus();


        return;
    }


    // ========================================
    // CHECK LOGIN
    // ========================================

    const currentToken =
        getToken();


    if (!currentToken) {

        alert(
            "Please login first."
        );


        window.location.href =
            "login.html";


        return;
    }


    // ========================================
    // SAVE CURRENT TOPIC
    // ========================================

    localStorage.setItem(
        "currentLearningTopic",
        topic
    );


    // ========================================
    // SHOW LOADING
    // ========================================

    showLoading();


    try {

        // ========================================
        // SEND REQUEST
        // ========================================

        const response =
            await fetch(
                API_URL +
                "/api/roadmaps",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            currentToken
                    },

                    body:
                        JSON.stringify({

                            topic:
                                topic,

                            preferredLanguage:
                                preferredLanguage,

                            learningLevel:
                                learningLevel,

                            duration:
                                duration
                        })
                }
            );


        // ========================================
        // READ RESPONSE
        // ========================================

        const data =
            await response.json();


        // ========================================
        // ERROR CHECK
        // ========================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to generate roadmap"
            );
        }


        // ========================================
        // CHECK ROADMAP
        // ========================================

        if (
            !data.roadmap ||
            !data.roadmap.roadmap ||
            !Array.isArray(
                data.roadmap.roadmap
            )
        ) {

            throw new Error(
                "Invalid roadmap response"
            );
        }


        // ========================================
        // DISPLAY ROADMAP
        // ========================================

        displayRoadmap(
            data.roadmap.roadmap
        );


    } catch (error) {

        console.error(
            "Roadmap Error:",
            error
        );


        resultContent.innerHTML =
            "";


        const errorDiv =
            document.createElement(
                "div"
            );


        errorDiv.className =
            "error-message";


        const errorHeading =
            document.createElement(
                "h3"
            );


        errorHeading.textContent =
            "❌ Something went wrong";


        const errorText =
            document.createElement(
                "p"
            );


        errorText.textContent =
            error.message;


        errorDiv.appendChild(
            errorHeading
        );


        errorDiv.appendChild(
            errorText
        );


        resultContent.appendChild(
            errorDiv
        );


        resultSection.classList.remove(
            "hidden"
        );


    } finally {

        hideLoading();
    }
}


// ========================================
// GENERATE BUTTON
// ========================================

if (
    generateRoadmapBtn
) {

    generateRoadmapBtn.addEventListener(
        "click",
        generateRoadmap
    );
}


// ========================================
// BACK TO DASHBOARD
// ========================================

if (
    backDashboardBtn
) {

    backDashboardBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "dashboard.html";
        }
    );
}


// ========================================
// LOAD GOAL WHEN PAGE OPENS
// ========================================

loadGoal();