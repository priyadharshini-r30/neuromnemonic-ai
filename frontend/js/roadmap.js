const API_URL = "http://localhost:5000";

// ========================================
// GET HTML ELEMENTS
// ========================================

const topicInput = document.getElementById("topic");
const languageSelect = document.getElementById("language");
const levelSelect = document.getElementById("level");
const durationInput = document.getElementById("duration");

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
// SHOW LOADING
// ========================================

function showLoading() {
    loading.classList.remove("hidden");
    resultSection.classList.add("hidden");
    generateRoadmapBtn.disabled = true;
}


// ========================================
// HIDE LOADING
// ========================================

function hideLoading() {
    loading.classList.add("hidden");
    generateRoadmapBtn.disabled = false;
}


// ========================================
// DISPLAY ROADMAP
// ========================================

function displayRoadmap(roadmapData) {

    resultContent.innerHTML = "";

    const journey = document.createElement("div");
    journey.className = "learning-journey";


    // ========================================
    // HEADER
    // ========================================

    const journeyHeader = document.createElement("div");
    journeyHeader.className = "journey-header";

    const journeyIcon = document.createElement("div");
    journeyIcon.className = "journey-icon";
    journeyIcon.textContent = "🗺️";

    const journeyText = document.createElement("div");

    const journeyTitle = document.createElement("h2");
    journeyTitle.textContent = "Your Learning Journey";

    const journeySubtitle = document.createElement("p");
    journeySubtitle.textContent =
        roadmapData.length + " days personalized for you";

    journeyText.appendChild(journeyTitle);
    journeyText.appendChild(journeySubtitle);

    journeyHeader.appendChild(journeyIcon);
    journeyHeader.appendChild(journeyText);

    journey.appendChild(journeyHeader);


    // ========================================
    // EACH DAY
    // ========================================

    roadmapData.forEach(function (day, index) {

        const dayWrapper =
            document.createElement("div");

        dayWrapper.className = "journey-day";


        // Day number
        const dayNumber =
            document.createElement("div");

        dayNumber.className = "day-number";

        dayNumber.textContent =
            String(day.day).padStart(2, "0");


        // Card
        const card =
            document.createElement("div");

        card.className = "journey-card";


        // ========================================
        // CARD TOP
        // ========================================

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
            String(day.day).padStart(2, "0");


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


        cardTop.appendChild(dayLabel);
        cardTop.appendChild(status);


        // ========================================
        // TOPIC
        // ========================================

        const topic =
            document.createElement("h3");

        topic.textContent =
            day.topic;


        // ========================================
        // DESCRIPTION
        // ========================================

        const description =
            document.createElement("p");

        description.textContent =
            day.description ||
            "Study this topic and practice the important concepts.";


        // ========================================
        // FOOTER
        // ========================================

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


        footer.appendChild(footerText);


        // ========================================
        // BUILD CARD
        // ========================================

        card.appendChild(cardTop);
        card.appendChild(topic);
        card.appendChild(description);
        card.appendChild(footer);


        // ========================================
        // BUILD DAY
        // ========================================

        dayWrapper.appendChild(dayNumber);
        dayWrapper.appendChild(card);

        journey.appendChild(dayWrapper);


        // ========================================
        // CONNECTOR
        // ========================================

        if (index < roadmapData.length - 1) {

            const line =
                document.createElement("div");

            line.className =
                "journey-line";

            journey.appendChild(line);
        }

    });


    resultContent.appendChild(journey);

    resultSection.classList.remove("hidden");


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

    const token =
        getToken();

    if (!token) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


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
                API_URL + "/api/roadmaps",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
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
        // DISPLAY
        // ========================================

        displayRoadmap(
            data.roadmap.roadmap
        );


    } catch (error) {

        console.error(
            "Roadmap Error:",
            error
        );


        resultContent.innerHTML = "";


        const errorDiv =
            document.createElement("div");

        errorDiv.className =
            "error-message";


        const errorHeading =
            document.createElement("h3");

        errorHeading.textContent =
            "❌ Something went wrong";


        const errorText =
            document.createElement("p");

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

if (generateRoadmapBtn) {

    generateRoadmapBtn.addEventListener(
        "click",
        generateRoadmap
    );

}


// ========================================
// BACK TO DASHBOARD
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