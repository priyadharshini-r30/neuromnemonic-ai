const API_URL = "http://localhost:5000/api/study-plans";

// Get token from localStorage
const token = localStorage.getItem("token");

const form = document.getElementById("studyPlanForm");
const message = document.getElementById("message");
const studyPlansContainer = document.getElementById("studyPlans");

// If user is not logged in
if (!token) {
    message.textContent = "Please login first.";
    message.style.color = "red";
}

// Create study plan
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!token) {
        message.textContent = "Please login first.";
        message.style.color = "red";
        return;
    }

    const subject = document.getElementById("subject").value.trim();
    const topic = document.getElementById("topic").value.trim();
    const date = document.getElementById("date").value;
    const duration = document.getElementById("duration").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                subject,
                topic,
                date,
                duration: Number(duration)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create study plan");
        }

        message.textContent = "Study plan added successfully!";
        message.style.color = "green";

        form.reset();

        loadStudyPlans();

    } catch (error) {
        console.error("Create study plan error:", error);

        message.textContent = error.message;
        message.style.color = "red";
    }
});

// Load study plans
async function loadStudyPlans() {

    if (!token) {
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load study plans");
        }

        displayStudyPlans(data.studyPlans);

    } catch (error) {
        console.error("Load study plans error:", error);

        studyPlansContainer.innerHTML = `
            <p class="empty-message">
                Unable to load study plans.
            </p>
        `;
    }
}

// Display study plans
function displayStudyPlans(plans) {

    if (!plans || plans.length === 0) {

        studyPlansContainer.innerHTML = `
            <p class="empty-message">
                No study plans yet.
            </p>
        `;

        return;
    }

    studyPlansContainer.innerHTML = "";

    plans.forEach((plan) => {

        const planDiv = document.createElement("div");

        planDiv.className = "plan-item";

        if (plan.completed) {
            planDiv.classList.add("completed");
        }

        planDiv.innerHTML = `
            <h3>📚 ${plan.subject}</h3>

            <p>
                <strong>Topic:</strong>
                ${plan.topic}
            </p>

            <p>
                <strong>📅 Date:</strong>
                ${plan.date}
            </p>

            <p>
                <strong>⏰ Duration:</strong>
                ${plan.duration} minutes
            </p>

            ${
                plan.completed
                    ? `
                        <button class="complete-btn" disabled>
                            ✅ Completed
                        </button>
                    `
                    : `
                        <button
                            class="complete-btn"
                            onclick="completeStudyPlan('${plan._id}')"
                        >
                            ✔ Mark as Complete
                        </button>
                    `
            }
        `;

        studyPlansContainer.appendChild(planDiv);
    });
}

// Mark study plan as completed
async function completeStudyPlan(id) {

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${id}/complete`,
            {
                method: "PUT",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to complete study plan"
            );
        }

        loadStudyPlans();

    } catch (error) {

        console.error("Complete study plan error:", error);

        alert(error.message);
    }
}

// Load plans when page opens
loadStudyPlans();