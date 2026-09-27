// ==========================================
// GOAL SETUP - GOAL TYPE SELECTION
// ==========================================

const token =
    localStorage.getItem("token");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!token) {

    window.location.href =
        "login.html";
}


// ==========================================
// ELEMENTS
// ==========================================

const goalSelectionForm =
    document.getElementById(
        "goalSelectionForm"
    );

const message =
    document.getElementById(
        "message"
    );


// ==========================================
// GOAL SELECTION
// ==========================================

goalSelectionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const selectedGoal =
            document.querySelector(
                'input[name="goalType"]:checked'
            );


        // ==================================
        // NO SELECTION
        // ==================================

        if (!selectedGoal) {

            message.textContent =
                "Please select a learning goal to continue.";

            return;
        }


        // ==================================
        // SAVE TEMPORARILY
        // ==================================

        const goalType =
            selectedGoal.value;


        localStorage.setItem(
            "selectedGoalType",
            goalType
        );


        console.log(
            "Selected Goal Type:",
            goalType
        );


        // ==================================
        // GO TO DETAILS PAGE
        // ==================================

        window.location.href =
            "goal-details.html";

    }
);


// ==========================================
// BACK BUTTON
// ==========================================

function goBack() {

    window.location.href =
        "dashboard.html";
}