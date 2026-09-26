const API_URL =
    "http://localhost:5000/api/revisions";


const token =
    localStorage.getItem("token");


const message =
    document.getElementById("message");


const revisionList =
    document.getElementById("revisionList");


// ========================================
// LOGIN CHECK
// ========================================

if (!token) {

    message.textContent =
        "Please login first.";

    message.style.color =
        "red";

} else {

    loadRevisions();

}


// ========================================
// LOAD REVISIONS
// ========================================

async function loadRevisions() {

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
                "Failed to load revisions"
            );

        }


        displayRevisions(
            data.revisions
        );


    } catch (error) {

        console.error(
            "Load revisions error:",
            error
        );


        revisionList.innerHTML = `
            <p class="empty">
                Unable to load revisions.
            </p>
        `;

    }

}


// ========================================
// DISPLAY REVISIONS
// ========================================

function displayRevisions(revisions) {

    if (
        !revisions ||
        revisions.length === 0
    ) {

        revisionList.innerHTML = `
            <p class="empty">
                No automatic revisions yet.
                <br><br>
                Complete a quiz to create your
                first revision schedule.
            </p>
        `;

        return;
    }


    revisionList.innerHTML = "";


    revisions.forEach((revision) => {

        const revisionDiv =
            document.createElement("div");


        revisionDiv.className =
            "revision-item";


        if (revision.completed) {

            revisionDiv.classList.add(
                "completed"
            );

        }


        revisionDiv.innerHTML = `

            <h3>
                📚 ${escapeHTML(
                    revision.subject
                )}
            </h3>


            <p>
                <strong>Topic:</strong>
                ${escapeHTML(
                    revision.topic
                )}
            </p>


            <p>
                <strong>🎯 Quiz Score:</strong>
                ${revision.score}
                /
                ${revision.totalQuestions}
            </p>


            <p>
                <strong>📊 Percentage:</strong>
                ${revision.percentage}%
            </p>


            <p>
                <strong>🧠 Revision Interval:</strong>
                ${revision.intervalDays}
                day(s)
            </p>


            <p>
                <strong>📅 Revision Date:</strong>
                ${revision.revisionDate}
            </p>


            ${
                revision.completed

                ? `
                    <button
                        class="complete-btn"
                        disabled
                    >
                        ✅ Revision Completed
                    </button>
                  `

                : `
                    <button
                        class="complete-btn"
                        onclick="completeRevision('${revision._id}')"
                    >
                        ✔ Mark as Complete
                    </button>
                  `
            }

        `;


        revisionList.appendChild(
            revisionDiv
        );

    });

}


// ========================================
// MARK REVISION AS COMPLETED
// ========================================

async function completeRevision(id) {

    if (!token) {

        alert(
            "Please login first."
        );

        return;
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


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to complete revision"
            );

        }


        loadRevisions();


    } catch (error) {

        console.error(
            "Complete revision error:",
            error
        );


        alert(
            error.message
        );

    }

}


// ========================================
// SECURITY HELPER
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;
}