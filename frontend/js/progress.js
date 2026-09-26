const API_URL = "http://localhost:5000/api/progress";

const token = localStorage.getItem("token");

const overallProgress =
    document.getElementById("overallProgress");

const averageScore =
    document.getElementById("averageScore");

const totalQuizzes =
    document.getElementById("totalQuizzes");

const studyCompletion =
    document.getElementById("studyCompletion");

const studyPlanCount =
    document.getElementById("studyPlanCount");

const revisionCompletion =
    document.getElementById("revisionCompletion");

const revisionCount =
    document.getElementById("revisionCount");

const topicPerformance =
    document.getElementById("topicPerformance");

const recentAttempts =
    document.getElementById("recentAttempts");


if (!token) {

    alert("Please login first.");

    window.location.href =
        "login.html";

} else {

    loadProgress();

}


/* =========================
   LOAD PROGRESS
========================= */

async function loadProgress() {

    try {

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

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load progress"
            );

        }

        if (!data.success) {

            throw new Error(
                "Progress data unavailable"
            );

        }

        displayProgress(
            data.progress
        );

    } catch (error) {

        console.error(
            "Progress loading error:",
            error
        );

        topicPerformance.innerHTML = `
            <p class="empty-message">
                ❌ Unable to load progress.
                <br><br>
                Please try again later.
            </p>
        `;

        recentAttempts.innerHTML = `
            <p class="empty-message">
                ❌ Unable to load quiz history.
            </p>
        `;

    }

}


/* =========================
   DISPLAY PROGRESS
========================= */

function displayProgress(progress) {

    overallProgress.textContent =
        `${progress.overallProgress}%`;

    averageScore.textContent =
        `${progress.averageScore}%`;

    totalQuizzes.textContent =
        progress.totalQuizzes;

    studyCompletion.textContent =
        `${progress.studyCompletion}%`;

    studyPlanCount.textContent =
        `${progress.completedStudyPlans} / ${progress.totalStudyPlans} Completed`;

    revisionCompletion.textContent =
        `${progress.revisionCompletion}%`;

    revisionCount.textContent =
        `${progress.completedRevisions} / ${progress.totalRevisions} Completed`;


    displayTopicPerformance(
        progress.topicPerformance
    );


    displayRecentAttempts(
        progress.recentQuizAttempts
    );

}


/* =========================
   TOPIC PERFORMANCE
========================= */

function displayTopicPerformance(
    topics
) {

    if (
        !topics ||
        topics.length === 0
    ) {

        topicPerformance.innerHTML = `
            <p class="empty-message">
                📚 No topic performance yet.
                <br><br>
                Complete a quiz to see
                your topic performance.
            </p>
        `;

        return;
    }


    topicPerformance.innerHTML = "";


    topics.forEach(
        topic => {

            const topicItem =
                document.createElement(
                    "div"
                );

            topicItem.className =
                "topic-item";


            let statusClass =
                "needs-practice";

            if (
                topic.status ===
                "Strong"
            ) {

                statusClass =
                    "strong";

            } else if (
                topic.status ===
                "Weak"
            ) {

                statusClass =
                    "weak";

            }


            topicItem.innerHTML = `

                <div class="topic-header">

                    <span class="topic-name">
                        ${escapeHTML(
                            topic.topic
                        )}
                    </span>

                    <span class="topic-score">
                        ${topic.percentage}%
                    </span>

                </div>


                <div class="topic-progress-bar">

                    <div
                        class="topic-progress-fill"
                        style="width: ${topic.percentage}%"
                    ></div>

                </div>


                <div class="topic-info">

                    <span class="topic-attempts">

                        ${topic.attempts}
                        attempt(s)

                    </span>


                    <span
                        class="topic-status ${statusClass}"
                    >

                        ${getStatusIcon(
                            topic.status
                        )}

                        ${escapeHTML(
                            topic.status
                        )}

                    </span>

                </div>

            `;


            topicPerformance.appendChild(
                topicItem
            );

        }
    );

}


/* =========================
   RECENT QUIZ ATTEMPTS
========================= */

function displayRecentAttempts(
    attempts
) {

    if (
        !attempts ||
        attempts.length === 0
    ) {

        recentAttempts.innerHTML = `
            <p class="empty-message">

                📝 No quiz attempts yet.

                <br><br>

                Complete your first quiz
                to start tracking progress.

            </p>
        `;

        return;
    }


    recentAttempts.innerHTML = "";


    attempts.forEach(
        attempt => {

            const attemptItem =
                document.createElement(
                    "div"
                );

            attemptItem.className =
                "attempt-item";


            const date =
                formatDate(
                    attempt.createdAt
                );


            attemptItem.innerHTML = `

                <div class="attempt-header">

                    <span class="attempt-topic">

                        📚
                        ${escapeHTML(
                            attempt.topic
                        )}

                    </span>


                    <span class="attempt-score">

                        ${attempt.percentage}%

                    </span>

                </div>


                <div class="attempt-details">

                    Subject:
                    ${escapeHTML(
                        attempt.subject
                    )}

                    <br>

                    Score:
                    ${attempt.score}
                    /
                    ${attempt.totalQuestions}

                </div>


                <div class="attempt-date">

                    📅 ${date}

                </div>

            `;


            recentAttempts.appendChild(
                attemptItem
            );

        }
    );

}


/* =========================
   STATUS ICON
========================= */

function getStatusIcon(status) {

    if (status === "Strong") {

        return "🟢";

    }

    if (status === "Weak") {

        return "🔴";

    }

    return "🟡";

}


/* =========================
   DATE FORMAT
========================= */

function formatDate(dateString) {

    if (!dateString) {

        return "Date unavailable";

    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {

        return "Date unavailable";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================
   HTML SAFETY
========================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text ?? "";

    return div.innerHTML;

}