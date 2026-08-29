const API_URL = "http://localhost:5000/api/study-plans";

// Get token from localStorage
const token = localStorage.getItem("token");

const form = document.getElementById("studyPlanForm");
const message = document.getElementById("message");
const studyPlansContainer = document.getElementById("studyPlans");


// ===============================
// SET MINIMUM DATE AS TODAY
// ===============================

const dateInput = document.getElementById("date");

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const todayString = `${year}-${month}-${day}`;

dateInput.min = todayString;


// ===============================
// LOGIN CHECK
// ===============================

if (!token) {
    message.textContent = "Please login first.";
    message.style.color = "red";
}


// ===============================
// CREATE STUDY PLAN
// ===============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!token) {

        message.textContent = "Please login first.";
        message.style.color = "red";

        return;
    }


    const subject =
        document.getElementById("subject").value.trim();

    const topic =
        document.getElementById("topic").value.trim();

    const date =
        dateInput.value;

    const duration =
        document.getElementById("duration").value;


    // ===============================
    // DATE VALIDATION
    // ===============================

    if (!date) {

        message.textContent =
            "Please select a study date.";

        message.style.color = "red";

        return;
    }


    // Past date check
    if (date < todayString) {

        message.textContent =
            "Past dates are not allowed. Please select today or a future date.";

        message.style.color = "red";

        return;
    }


    // ===============================
    // DURATION VALIDATION
    // ===============================

    if (!duration || Number(duration) <= 0) {

        message.textContent =
            "Please enter a valid study duration.";

        message.style.color = "red";

        return;
    }


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization":
                    `Bearer ${token}`

            },

            body: JSON.stringify({

                subject,

                topic,

                date,

                duration:
                    Number(duration)

            })

        });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create study plan"
            );

        }


        message.textContent =
            "Study plan added successfully!";

        message.style.color =
            "green";


        form.reset();


        // Reset minimum date
        dateInput.min =
            todayString;


        loadStudyPlans();


    } catch (error) {

        console.error(
            "Create study plan error:",
            error
        );


        message.textContent =
            error.message;

        message.style.color =
            "red";

    }

});


// ===============================
// LOAD STUDY PLANS
// ===============================

async function loadStudyPlans() {

    if (!token) {
        return;
    }


    try {

        const response = await fetch(
            API_URL,
            {

                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load study plans"
            );

        }


        displayStudyPlans(
            data.studyPlans
        );


    } catch (error) {

        console.error(
            "Load study plans error:",
            error
        );


        studyPlansContainer.innerHTML = `
            <p class="empty-message">
                Unable to load study plans.
            </p>
        `;

    }

}


// ===============================
// DISPLAY STUDY PLANS
// ===============================

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

        const planDiv =
            document.createElement("div");


        planDiv.className =
            "plan-item";


        if (plan.completed) {

            planDiv.classList.add(
                "completed"
            );

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

                        <button
                            class="complete-btn"
                            disabled
                        >
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


        studyPlansContainer.appendChild(
            planDiv
        );

    });

}


// ===============================
// MARK AS COMPLETED
// ===============================

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

                    "Authorization":
                        `Bearer ${token}`

                }

            }

        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "Failed to complete study plan"

            );

        }


        loadStudyPlans();


    } catch (error) {

        console.error(
            "Complete study plan error:",
            error
        );


        alert(
            error.message
        );

    }

}


// ===============================
// LOAD PLANS ON PAGE OPEN
// ===============================

loadStudyPlans();