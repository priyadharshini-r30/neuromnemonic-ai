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
// TOKEN
// ========================================

function getToken() {

    return localStorage.getItem("token");

}


const token = getToken();


if (!token) {

    window.location.href =
        "login.html";

}


// ========================================
// SAVED GOAL
// ========================================

let savedGoal = null;


// ========================================
// CURRENT SAVED ROADMAP
// ========================================

let currentRoadmap = null;


// ========================================
// LOAD GOAL
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


        createGoalSummary(data);

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

    const summary =
        document.getElementById(
            "goalSummary"
        );


    if (!summary) {
        return;
    }


    const summaryGoal =
        document.getElementById(
            "summaryGoal"
        );


    const summaryTopic =
        document.getElementById(
            "summaryTopic"
        );


    const summaryLevel =
        document.getElementById(
            "summaryLevel"
        );


    const summaryStudyHours =
        document.getElementById(
            "summaryStudyHours"
        );


    let goalTypes = [];


    if (Array.isArray(goal.goalType)) {

        goalTypes = goal.goalType;

    } else if (goal.goalType) {

        goalTypes = [goal.goalType];

    }


    if (summaryGoal) {

        summaryGoal.textContent =
            goalTypes.length
                ? goalTypes.join(" + ")
                : "Not specified";

    }


    let subjects = [];


    if (Array.isArray(goal.subjects)) {

        subjects = goal.subjects;

    }


    let topicText = "";


    if (subjects.length) {

        topicText =
            subjects.join(", ");

    }


    if (
        goal.examName ||
        goal.examGroup
    ) {

        if (topicText) {

            topicText += " | ";

        }


        topicText +=
            goal.examName || "";


        if (goal.examGroup) {

            topicText +=
                " - " +
                goal.examGroup;

        }

    }


    if (summaryTopic) {

        summaryTopic.textContent =
            topicText ||
            "Not specified";

    }


    if (summaryLevel) {

        summaryLevel.textContent =
            goal.preparationLevel ||
            "Beginner";

    }


    if (summaryStudyHours) {

        summaryStudyHours.textContent =
            `${goal.dailyStudyHours || 0} hours`;

    }

}


// ========================================
// FILL ROADMAP INPUTS
// ========================================

function fillRoadmapInputs(goal) {

    let goalTypes = [];


    if (Array.isArray(goal.goalType)) {

        goalTypes = goal.goalType;

    } else if (goal.goalType) {

        goalTypes = [goal.goalType];

    }


    const hasAcademic =
        goalTypes.includes("Academic");


    const hasCompetitive =
        goalTypes.includes("Competitive Exam");


    // ========================================
    // ACADEMIC ONLY
    // ========================================

    if (
        hasAcademic &&
        !hasCompetitive
    ) {

        if (
            Array.isArray(goal.subjects) &&
            goal.subjects.length > 0
        ) {

            topicInput.value =
                goal.subjects.join(", ");

        }


        languageSelect.value =
            "English";


        levelSelect.value =
            "Beginner";


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


        levelSelect.value =
            goal.preparationLevel ||
            "Beginner";


        languageSelect.value =
            "English";


        return;

    }


    // ========================================
    // ACADEMIC + COMPETITIVE
    // ========================================

    if (
        hasAcademic &&
        hasCompetitive
    ) {

        let combinedTopic = "";


        if (
            Array.isArray(goal.subjects) &&
            goal.subjects.length
        ) {

            combinedTopic =
                "Academic Subjects: " +
                goal.subjects.join(", ");

        }


        if (
            goal.examName ||
            goal.examGroup
        ) {

            if (combinedTopic) {

                combinedTopic +=
                    " | ";

            }


            combinedTopic +=
                "Competitive Exam: ";


            if (goal.examName) {

                combinedTopic +=
                    goal.examName;

            }


            if (goal.examGroup) {

                combinedTopic +=
                    " - " +
                    goal.examGroup;

            }

        }


        topicInput.value =
            combinedTopic;


        levelSelect.value =
            goal.preparationLevel ||
            "Beginner";


        languageSelect.value =
            "English";

    }

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
    roadmapData,
    roadmapId
) {

    resultContent.innerHTML = "";


    if (
        !Array.isArray(roadmapData) ||
        roadmapData.length === 0
    ) {

        resultContent.innerHTML = `
            <div class="error-message">
                <h3>❌ No roadmap found</h3>
                <p>Please generate a new roadmap.</p>
            </div>
        `;


        resultSection.classList.remove(
            "hidden"
        );


        return;

    }


    // ========================================
    // SAVE CURRENT ROADMAP
    // ========================================

    currentRoadmap =
        roadmapData;


    localStorage.setItem(
        "currentRoadmapId",
        roadmapId
    );


    // ========================================
    // LEARNING JOURNEY
    // ========================================

    const journey =
        document.createElement("div");


    journey.className =
        "learning-journey";


    // ========================================
    // HEADER
    // ========================================

    const journeyHeader =
        document.createElement("div");


    journeyHeader.className =
        "journey-header";


    const journeyIcon =
        document.createElement("div");


    journeyIcon.className =
        "journey-icon";


    journeyIcon.textContent =
        "🗺️";


    const journeyText =
        document.createElement("div");


    const journeyTitle =
        document.createElement("h2");


    journeyTitle.textContent =
        "Your Learning Journey";


    const journeySubtitle =
        document.createElement("p");


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
    // DAYS
    // ========================================

    roadmapData.forEach(
        function (day, index) {

            const dayWrapper =
                document.createElement("div");


            dayWrapper.className =
                "journey-day";


            const dayNumber =
                document.createElement("div");


            dayNumber.className =
                "day-number";


            dayNumber.textContent =
                String(day.day)
                    .padStart(2, "0");


            const card =
                document.createElement("div");


            card.className =
                "journey-card";


            const cardTop =
                document.createElement("div");


            cardTop.className =
                "journey-card-top";


            const dayLabel =
                document.createElement("span");


            dayLabel.className =
                "day-label";


            dayLabel.textContent =
                "DAY " +
                String(day.day)
                    .padStart(2, "0");


            const status =
                document.createElement("span");


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


            const topic =
                document.createElement("h3");


            topic.textContent =
                day.topic;


            const description =
                document.createElement("p");


            description.textContent =
                day.description ||
                "Study this topic and practice the important concepts.";


            const footer =
                document.createElement("div");


            footer.className =
                "journey-footer";


            const footerText =
                document.createElement("span");


            footerText.textContent =
                day.completed
                    ? "🎉 Great work!"
                    : "📖 Keep learning";


            footer.appendChild(
                footerText
            );


            // ========================================
            // LEARN BUTTON
            // ========================================

            const learnButton =
                document.createElement("button");


            learnButton.type =
                "button";


            learnButton.textContent =
                day.completed
                    ? "✓ Completed"
                    : "📖 Learn";


            learnButton.disabled =
                Boolean(day.completed);


            learnButton.style.marginLeft =
                "10px";


            if (!day.completed) {

                learnButton.addEventListener(
                    "click",
                    function () {

                        openLearningDay(
                            roadmapId,
                            day
                        );

                    }
                );

            }


            footer.appendChild(
                learnButton
            );


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


            dayWrapper.appendChild(
                dayNumber
            );


            dayWrapper.appendChild(
                card
            );


            journey.appendChild(
                dayWrapper
            );


            if (
                index <
                roadmapData.length - 1
            ) {

                const line =
                    document.createElement("div");


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
    // FIND FIRST INCOMPLETE
    // ========================================

    const firstIncomplete =
        roadmapData.find(
            day =>
                !day.completed
        );


    // ========================================
    // START LEARNING
    // ========================================

    const startLearningArea =
        document.createElement("div");


    startLearningArea.style.textAlign =
        "center";


    startLearningArea.style.marginTop =
        "30px";


    const startLearningBtn =
        document.createElement("button");


    startLearningBtn.type =
        "button";


    startLearningBtn.textContent =
        firstIncomplete
            ? "🚀 Continue Learning"
            : "🎉 Roadmap Completed";


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
        firstIncomplete
            ? "pointer"
            : "default";


    startLearningBtn.style.fontSize =
        "15px";


    startLearningBtn.style.fontWeight =
        "600";


    if (firstIncomplete) {

        startLearningBtn.addEventListener(
            "click",
            function () {

                openLearningDay(
                    roadmapId,
                    firstIncomplete
                );

            }
        );

    } else {

        startLearningBtn.disabled =
            true;

    }


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

}


// ========================================
// OPEN LEARNING DAY
// ========================================

function openLearningDay(
    roadmapId,
    day
) {

    localStorage.setItem(
        "currentRoadmapId",
        roadmapId
    );


    localStorage.setItem(
        "currentLearningDay",
        String(day.day)
    );


    localStorage.setItem(
        "currentLearningTopic",
        day.topic
    );


    localStorage.setItem(
        "currentLearningDescription",
        day.description || ""
    );


    localStorage.setItem(
        "currentLearningLanguage",
        languageSelect.value
    );


    localStorage.setItem(
        "currentLearningLevel",
        levelSelect.value
    );


    window.location.href =
        "ai-tutor.html";

}


// ========================================
// LOAD EXISTING ROADMAP
// ========================================

async function loadExistingRoadmap() {

    try {

        const response =
            await fetch(
                API_URL + "/api/roadmaps",
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
                "Roadmap fetch failed:",
                data.message
            );

            return false;

        }


        if (
            !data.roadmaps ||
            !Array.isArray(data.roadmaps) ||
            data.roadmaps.length === 0
        ) {

            return false;

        }


        // ========================================
        // GET LATEST SAVED ROADMAP
        // ========================================

        const latestRoadmap =
            data.roadmaps[0];


        if (
            !latestRoadmap ||
            !Array.isArray(
                latestRoadmap.roadmap
            )
        ) {

            return false;

        }


        currentRoadmap =
            latestRoadmap.roadmap;


        localStorage.setItem(
            "currentRoadmapId",
            latestRoadmap._id
        );


        localStorage.setItem(
            "currentRoadmapTopic",
            latestRoadmap.topic || ""
        );


        // ========================================
        // DISPLAY SAVED ROADMAP
        // ========================================

        displayRoadmap(
            latestRoadmap.roadmap,
            latestRoadmap._id
        );


        return true;


    } catch (error) {

        console.error(
            "Existing Roadmap Load Error:",
            error
        );


        return false;

    }

}


// ========================================
// GENERATE NEW ROADMAP
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


    if (!topic) {

        alert(
            "Please enter a topic you want to learn."
        );


        topicInput.focus();


        return;

    }


    if (
        isNaN(duration) ||
        duration < 1 ||
        duration > 40
    ) {

        alert(
            "Please enter study duration between 1 and 40 days."
        );


        durationInput.focus();


        return;

    }


    const currentToken =
        getToken();


    if (!currentToken) {

        window.location.href =
            "login.html";


        return;

    }


    showLoading();


    try {

        const response =
            await fetch(
                API_URL + "/api/roadmaps",
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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to generate roadmap"
            );

        }


        if (
            !data.roadmap ||
            !Array.isArray(
                data.roadmap.roadmap
            )
        ) {

            throw new Error(
                "Invalid roadmap response"
            );

        }


        const roadmapId =
            data.roadmap._id;


        localStorage.setItem(
            "currentRoadmapId",
            roadmapId
        );


        localStorage.setItem(
            "currentRoadmapTopic",
            topic
        );


        // ========================================
        // CLEAR OLD LEARNING DATA
        // ========================================

        localStorage.removeItem(
            "currentLearningDay"
        );


        localStorage.removeItem(
            "currentLearningTopic"
        );


        localStorage.removeItem(
            "currentLearningDescription"
        );


        displayRoadmap(
            data.roadmap.roadmap,
            roadmapId
        );


    } catch (error) {

        console.error(
            "Roadmap Error:",
            error
        );


        resultContent.innerHTML = `
            <div class="error-message">

                <h3>
                    ❌ Something went wrong
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>
        `;


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

if (generateRoadmapBtn) {

    generateRoadmapBtn.addEventListener(
        "click",
        generateRoadmap
    );

}


// ========================================
// BACK DASHBOARD
// ========================================

if (backDashboardBtn) {

    backDashboardBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "dashboard.html";

        }
    );

}


// ========================================
// PAGE INITIALIZATION
// ========================================

async function initializeRoadmapPage() {

    // First load the user's goal

    await loadGoal();


    // Then check MongoDB for existing roadmap

    const roadmapExists =
        await loadExistingRoadmap();


    if (roadmapExists) {

        console.log(
            "Existing roadmap loaded. AI generation skipped."
        );

    } else {

        console.log(
            "No saved roadmap found. User can generate a new roadmap."
        );

    }

}


// ========================================
// START
// ========================================

initializeRoadmapPage();