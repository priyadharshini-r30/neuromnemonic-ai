// ========================================
// NEUROMNEMONIC AI
// DAILY STUDY PLANNER
// ========================================


// ========================================
// API URL
// ========================================

const API_URL = "http://localhost:5000/api/study-plans";


// ========================================
// GET TOKEN
// ========================================

const token = localStorage.getItem("token");


// ========================================
// GET HTML ELEMENTS
// ========================================

const form = document.getElementById("studyPlanForm");

const message = document.getElementById("message");

const studyPlansContainer =
    document.getElementById("studyPlans");

const dateInput =
    document.getElementById("date");

const addPlanBtn =
    document.getElementById("addPlanBtn");

const backDashboardBtn =
    document.getElementById("backDashboardBtn");


// ========================================
// LOGIN CHECK
// ========================================

if (!token && message) {

    message.textContent = "Please login first.";

    message.style.color = "red";
}


// ========================================
// SET TODAY AS MINIMUM DATE
// ========================================

function setMinimumDate() {

    if (!dateInput) {
        return;
    }

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    const todayString =
        `${year}-${month}-${day}`;

    dateInput.min = todayString;
}


// ========================================
// INITIAL DATE SETUP
// ========================================

setMinimumDate();


// ========================================
// CREATE STUDY PLAN
// ========================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("Study plan form submitted");


            // ========================================
            // LOGIN CHECK
            // ========================================

            if (!token) {

                showMessage(
                    "Please login first.",
                    "red"
                );

                return;
            }


            // ========================================
            // GET FORM VALUES
            // ========================================

            const subjectInput =
                document.getElementById("subject");

            const topicInput =
                document.getElementById("topic");

            const durationInput =
                document.getElementById("duration");


            const subject =
                subjectInput.value.trim();

            const topic =
                topicInput.value.trim();

            const date =
                dateInput.value;

            const duration =
                durationInput.value;


            // ========================================
            // VALIDATE SUBJECT
            // ========================================

            if (!subject) {

                showMessage(
                    "Please enter a subject.",
                    "red"
                );

                subjectInput.focus();

                return;
            }


            // ========================================
            // VALIDATE TOPIC
            // ========================================

            if (!topic) {

                showMessage(
                    "Please enter a topic.",
                    "red"
                );

                topicInput.focus();

                return;
            }


            // ========================================
            // VALIDATE DATE
            // ========================================

            if (!date) {

                showMessage(
                    "Please select a study date.",
                    "red"
                );

                dateInput.focus();

                return;
            }


            // ========================================
            // GET TODAY
            // ========================================

            const today = new Date();

            const year =
                today.getFullYear();

            const month =
                String(
                    today.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    today.getDate()
                ).padStart(2, "0");

            const todayString =
                `${year}-${month}-${day}`;


            // ========================================
            // CHECK PAST DATE
            // ========================================

            if (date < todayString) {

                showMessage(
                    "Past dates are not allowed. Please select today or a future date.",
                    "red"
                );

                return;
            }


            // ========================================
            // VALIDATE DURATION
            // ========================================

            if (
                !duration ||
                Number(duration) <= 0
            ) {

                showMessage(
                    "Please enter a valid study duration.",
                    "red"
                );

                durationInput.focus();

                return;
            }


            // ========================================
            // DISABLE BUTTON
            // ========================================

            if (addPlanBtn) {

                addPlanBtn.disabled = true;

                addPlanBtn.textContent =
                    "Saving... ⏳";
            }


            try {

                console.log(
                    "Sending study plan to:",
                    API_URL
                );

                console.log({
                    subject,
                    topic,
                    date,
                    duration: Number(duration)
                });


                // ========================================
                // SEND TO BACKEND
                // ========================================

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                subject: subject,
                                topic: topic,
                                date: date,
                                duration:
                                    Number(duration)
                            })
                        }
                    );


                // ========================================
                // READ RESPONSE
                // ========================================

                const data =
                    await response.json();


                console.log(
                    "Backend response:",
                    data
                );


                // ========================================
                // CHECK RESPONSE
                // ========================================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to create study plan"
                    );
                }


                // ========================================
                // SUCCESS
                // ========================================

                showMessage(
                    "Study plan added successfully!",
                    "green"
                );


                // ========================================
                // CLEAR FORM
                // ========================================

                form.reset();


                // ========================================
                // RESET DATE
                // ========================================

                setMinimumDate();


                // ========================================
                // LOAD SAVED PLANS
                // ========================================

                await loadStudyPlans();

            }

            catch (error) {

                console.error(
                    "Create study plan error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Failed to create study plan.",
                    "red"
                );

            }

            finally {

                // ========================================
                // ENABLE BUTTON
                // ========================================

                if (addPlanBtn) {

                    addPlanBtn.disabled = false;

                    addPlanBtn.textContent =
                        "➕ Add Study Plan";
                }
            }
        }
    );
}


// ========================================
// LOAD STUDY PLANS
// ========================================

async function loadStudyPlans() {

    if (!studyPlansContainer) {
        return;
    }


    // ========================================
    // LOGIN CHECK
    // ========================================

    if (!token) {

        studyPlansContainer.innerHTML = `
            <p class="empty-message">
                Please login to view your study plans.
            </p>
        `;

        return;
    }


    try {

        console.log(
            "Loading study plans..."
        );


        const response =
            await fetch(
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


        console.log(
            "Study plans from database:",
            data
        );


        // ========================================
        // CHECK RESPONSE
        // ========================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load study plans"
            );
        }


        // ========================================
        // DISPLAY
        // ========================================

        displayStudyPlans(
            data.studyPlans || []
        );

    }

    catch (error) {

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


// ========================================
// DISPLAY STUDY PLANS
// ========================================

function displayStudyPlans(plans) {

    // ========================================
    // NO PLANS
    // ========================================

    if (
        !plans ||
        plans.length === 0
    ) {

        studyPlansContainer.innerHTML = `
            <p class="empty-message">
                No study plans yet.
            </p>
        `;

        return;
    }


    // ========================================
    // CLEAR OLD DATA
    // ========================================

    studyPlansContainer.innerHTML = "";


    // ========================================
    // DISPLAY EACH PLAN
    // ========================================

    plans.forEach(function (plan) {

        const planDiv =
            document.createElement("div");


        planDiv.className =
            "plan-item";


        // ========================================
        // COMPLETED CLASS
        // ========================================

        if (plan.completed) {

            planDiv.classList.add(
                "completed"
            );
        }


        // ========================================
        // PLAN CONTENT
        // ========================================

        planDiv.innerHTML = `

            <h3>
                📚 ${escapeHTML(plan.subject)}
            </h3>

            <p>
                <strong>Topic:</strong>
                ${escapeHTML(plan.topic)}
            </p>

            <p>
                <strong>📅 Date:</strong>
                ${escapeHTML(
                    formatDate(plan.date)
                )}
            </p>

            <p>
                <strong>⏰ Duration:</strong>
                ${plan.duration} minutes
            </p>

            ${
                plan.completed

                    ? `
                        <button
                            type="button"
                            class="complete-btn"
                            disabled
                        >
                            ✅ Completed
                        </button>
                    `

                    : `
                        <button
                            type="button"
                            class="complete-btn"
                        >
                            ✔ Mark as Complete
                        </button>
                    `
            }

        `;


        // ========================================
        // COMPLETE BUTTON
        // ========================================

        const completeButton =
            planDiv.querySelector(
                ".complete-btn"
            );


        if (
            completeButton &&
            !plan.completed
        ) {

            completeButton.addEventListener(
                "click",
                function () {

                    completeStudyPlan(
                        plan._id,
                        completeButton
                    );
                }
            );
        }


        // ========================================
        // ADD TO PAGE
        // ========================================

        studyPlansContainer.appendChild(
            planDiv
        );

    });
}


// ========================================
// MARK STUDY PLAN AS COMPLETED
// ========================================

async function completeStudyPlan(
    id,
    button
) {

    if (!token) {

        alert(
            "Please login first."
        );

        return;
    }


    // ========================================
    // CONFIRM
    // ========================================

    const confirmed =
        confirm(
            "Have you completed this study plan?"
        );


    if (!confirmed) {
        return;
    }


    // ========================================
    // DISABLE BUTTON
    // ========================================

    if (button) {

        button.disabled = true;

        button.textContent =
            "Saving... ⏳";
    }


    try {

        const response =
            await fetch(
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


        console.log(
            "Complete response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to complete study plan"
            );
        }


        // ========================================
        // SUCCESS
        // ========================================

        showMessage(
            "Study plan marked as completed!",
            "green"
        );


        // ========================================
        // REFRESH FROM DATABASE
        // ========================================

        await loadStudyPlans();

    }

    catch (error) {

        console.error(
            "Complete study plan error:",
            error
        );


        alert(
            error.message ||
            "Failed to complete study plan."
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "✔ Mark as Complete";
        }
    }
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


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(
    text,
    color
) {

    if (!message) {
        return;
    }

    message.textContent =
        text;

    message.style.color =
        color;
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    // Backend stores YYYY-MM-DD
    if (
        typeof dateValue === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            dateValue
        )
    ) {

        const parts =
            dateValue.split("-");

        return (
            parts[2] +
            "-" +
            parts[1] +
            "-" +
            parts[0]
        );
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(dateValue);
    }


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const year =
        date.getFullYear();


    return (
        day +
        "-" +
        month +
        "-" +
        year
    );
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


// ========================================
// LOAD PLANS WHEN PAGE OPENS
// ========================================

loadStudyPlans();