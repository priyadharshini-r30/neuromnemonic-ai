const API_URL = "http://localhost:5000";

// Elements
const topicInput = document.getElementById("topic");
const languageSelect = document.getElementById("language");
const levelSelect = document.getElementById("level");

const loading = document.getElementById("loading");
const resultSection = document.getElementById("resultSection");
const resultTitle = document.getElementById("resultTitle");
const resultContent = document.getElementById("resultContent");

const learningOptions = document.querySelectorAll(".learning-option");
const teachEverythingBtn = document.getElementById("teachEverythingBtn");
const backDashboardBtn = document.getElementById("backDashboardBtn");


// Get login token
function getToken() {
    return localStorage.getItem("token");
}


// Show loading
function showLoading() {
    loading.classList.remove("hidden");
    resultSection.classList.add("hidden");
}


// Hide loading
function hideLoading() {
    loading.classList.add("hidden");
}


// Display normal result
function displayResult(title, content) {
    resultTitle.textContent = title;
    resultContent.textContent = content;

    resultSection.classList.remove("hidden");
}


// Display roadmap
function displayRoadmap(roadmapData) {
    resultTitle.textContent = "🗺️ Your Personalized Roadmap";

    resultContent.innerHTML = "";

    const roadmapList = document.createElement("div");
    roadmapList.className = "roadmap-list";

    roadmapData.forEach(day => {

        const dayCard = document.createElement("div");
        dayCard.className = "roadmap-day";

        dayCard.innerHTML = `
            <h3>Day ${day.day} — ${day.topic}</h3>
            <p>${day.description}</p>
            <span class="status">
                ${day.completed ? "✅ Completed" : "⏳ Not Completed"}
            </span>
        `;

        roadmapList.appendChild(dayCard);
    });

    resultContent.appendChild(roadmapList);

    resultSection.classList.remove("hidden");
}


// Generate learning content
async function generateLearningContent(type) {

    const topic = topicInput.value.trim();
    const language = languageSelect.value;
    const level = levelSelect.value;

    // Validate topic
    if (!topic) {
        alert("Please enter a topic you want to learn.");
        topicInput.focus();
        return;
    }

    // Check login
    const token = getToken();

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    showLoading();

    try {

        // Roadmap request
        if (type === "roadmap") {

            const response = await fetch(
                `${API_URL}/api/roadmaps`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        topic: topic,
                        preferredLanguage: language,
                        learningLevel: level,
                        duration: 7
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to generate roadmap"
                );
            }

            // Display AI-generated roadmap
            displayRoadmap(data.roadmap.roadmap);

            return;
        }


        // Other AI learning options
        const prompts = {

            explain:
                `Explain "${topic}" to a ${level} learner in ${language}. Use simple and clear language.`,

            mnemonic:
                `Create an easy mnemonic to remember "${topic}" for a ${level} learner. Respond in ${language}.`,

            story:
                `Explain "${topic}" through a memorable educational story for a ${level} learner. Respond in ${language}.`,

            everything:
                `Teach "${topic}" to a ${level} learner in ${language} using explanation, examples, mnemonic and a short story.`
        };


        const prompt = prompts[type];

        const response = await fetch(
            `${API_URL}/api/ai/ask`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: prompt
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "AI request failed"
            );
        }

        displayResult(
            `${topic} — ${type}`,
            data.reply
        );

    } catch (error) {

        console.error("Learning Error:", error);

        displayResult(
            "❌ Something went wrong",
            error.message
        );

    } finally {

        hideLoading();
    }
}


// Learning option buttons
learningOptions.forEach(button => {

    button.addEventListener("click", () => {

        const type = button.dataset.type;

        generateLearningContent(type);

    });

});


// Teach everything
teachEverythingBtn.addEventListener("click", () => {

    generateLearningContent("everything");

});


// Back to dashboard
backDashboardBtn.addEventListener("click", () => {

    window.location.href = "dashboard.html";

});