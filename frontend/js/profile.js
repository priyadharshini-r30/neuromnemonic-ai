// ==========================================
// NEUROMNEMONIC AI
// PROFILE JAVASCRIPT
// ==========================================


// ==========================================
// API URLS
// ==========================================

const PROFILE_API =
    "http://localhost:5000/api/profile";

const GOAL_API =
    "http://localhost:5000/api/goals";


// ==========================================
// AUTHENTICATION
// ==========================================

const token =
    localStorage.getItem("token");


const profileForm =
    document.getElementById("profileForm");


const message =
    document.getElementById("message");


// ==========================================
// LOGIN CHECK
// ==========================================

if (!token) {

    window.location.href =
        "login.html";

}


// ==========================================
// HELPER
// SET VALUE TO INPUT / SELECT / TEXT
// ==========================================

function setField(id, value) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    const finalValue =
        value !== undefined &&
        value !== null &&
        value !== ""
            ? value
            : "—";


    // INPUT / SELECT / TEXTAREA
    if (
        element.tagName === "INPUT" ||
        element.tagName === "SELECT" ||
        element.tagName === "TEXTAREA"
    ) {

        element.value =
            finalValue;

    }

    // NORMAL HTML ELEMENT
    else {

        element.textContent =
            finalValue;

    }

}


// ==========================================
// GET FIRST AVAILABLE VALUE
// ==========================================

function getValue(object, fields) {

    if (!object) {
        return "";
    }


    for (const field of fields) {

        if (
            object[field] !== undefined &&
            object[field] !== null &&
            object[field] !== ""
        ) {

            return object[field];

        }

    }


    return "";

}


// ==========================================
// CALCULATE AGE
// ==========================================

function calculateAge(dateOfBirth) {

    if (!dateOfBirth) {
        return "";
    }


    const birthDate =
        new Date(dateOfBirth);


    if (
        isNaN(
            birthDate.getTime()
        )
    ) {

        return "";

    }


    const today =
        new Date();


    let age =
        today.getFullYear() -
        birthDate.getFullYear();


    const monthDifference =
        today.getMonth() -
        birthDate.getMonth();


    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() <
            birthDate.getDate()
        )
    ) {

        age--;

    }


    return age >= 0
        ? age
        : "";

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "";

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


// ==========================================
// NORMALIZE GOAL TYPE
// ==========================================

function normalizeGoalTypes(goalType) {

    if (!goalType) {
        return [];
    }


    // Example:
    // ["Academic", "Competitive Exam"]

    if (Array.isArray(goalType)) {

        return goalType
            .map(
                item =>
                    String(item)
                        .trim()
                        .toLowerCase()
            )
            .filter(
                item => item !== ""
            );

    }


    // Example:
    // "Academic, Competitive Exam"

    return String(goalType)
        .split(",")
        .map(
            item =>
                item
                    .trim()
                    .toLowerCase()
        )
        .filter(
            item => item !== ""
        );

}


// ==========================================
// SHOW / HIDE GOAL SECTIONS
// ==========================================

function updateGoalSections(goal) {

    const academicSection =
        document.getElementById(
            "academicSection"
        );


    const competitiveSection =
        document.getElementById(
            "competitiveSection"
        );


    // ------------------------------------------
    // HIDE BOTH FIRST
    // ------------------------------------------

    if (academicSection) {

        academicSection.style.display =
            "none";

    }


    if (competitiveSection) {

        competitiveSection.style.display =
            "none";

    }


    // ------------------------------------------
    // GET SELECTED GOALS
    // ------------------------------------------

    const rawGoalType =
        getValue(
            goal,
            [
                "goalType",
                "type"
            ]
        );


    const selectedGoals =
        normalizeGoalTypes(
            rawGoalType
        );


    // ------------------------------------------
    // CHECK ACADEMIC
    // ------------------------------------------

    const hasAcademic =
        selectedGoals.some(
            goalName =>
                goalName.includes(
                    "academic"
                )
        );


    // ------------------------------------------
    // CHECK COMPETITIVE
    // ------------------------------------------

    const hasCompetitive =
        selectedGoals.some(
            goalName =>
                goalName.includes(
                    "competitive"
                ) ||
                goalName.includes(
                    "exam"
                )
        );


    // ------------------------------------------
    // SHOW ACADEMIC
    // ------------------------------------------

    if (
        hasAcademic &&
        academicSection
    ) {

        academicSection.style.display =
            "block";

    }


    // ------------------------------------------
    // SHOW COMPETITIVE
    // ------------------------------------------

    if (
        hasCompetitive &&
        competitiveSection
    ) {

        competitiveSection.style.display =
            "block";

    }


    console.log(
        "Selected Goals:",
        selectedGoals
    );

}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {

    try {

        // ======================================
        // GET USER PROFILE
        // ======================================

        const profileResponse =
            await fetch(
                PROFILE_API,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const profileData =
            await profileResponse.json();


        console.log(
            "Profile Data:",
            profileData
        );


        if (!profileResponse.ok) {

            throw new Error(
                profileData.message ||
                "Profile loading failed"
            );

        }


        const user =
            profileData.user ||
            profileData;


        // ======================================
        // FULL NAME
        // ======================================

        const name =
            getValue(
                user,
                [
                    "name",
                    "fullName",
                    "username"
                ]
            );


        setField(
            "name",
            name
        );


        // ======================================
        // EMAIL
        // ======================================

        const email =
            getValue(
                user,
                [
                    "email"
                ]
            );


        setField(
            "email",
            email
        );


        // ======================================
        // DATE OF BIRTH
        // ======================================

        const dateOfBirth =
            getValue(
                user,
                [
                    "dateOfBirth",
                    "dob"
                ]
            );


        const dobField =
            document.getElementById(
                "dateOfBirth"
            );


        if (
            dobField &&
            dateOfBirth
        ) {

            // If date input
            if (
                dobField.tagName === "INPUT" &&
                dobField.type === "date"
            ) {

                const date =
                    new Date(
                        dateOfBirth
                    );


                if (
                    !isNaN(
                        date.getTime()
                    )
                ) {

                    const year =
                        date.getFullYear();


                    const month =
                        String(
                            date.getMonth() + 1
                        ).padStart(2, "0");


                    const day =
                        String(
                            date.getDate()
                        ).padStart(2, "0");


                    dobField.value =
                        year +
                        "-" +
                        month +
                        "-" +
                        day;

                }

            }

            else {

                dobField.textContent =
                    formatDate(
                        dateOfBirth
                    );

            }

        }


        // ======================================
        // AGE
        // ======================================

        const age =
            calculateAge(
                dateOfBirth
            );


        setField(
            "age",
            age
        );


        // ======================================
        // EDUCATION QUALIFICATION
        // ======================================

        const education =
            getValue(
                user,
                [
                    "educationQualification",
                    "education",
                    "qualification",
                    "educationLevel"
                ]
            );


        const educationField =
            document.getElementById(
                "educationQualification"
            );


        if (educationField) {

            educationField.value =
                education || "";

        }


        // ======================================
        // ROLE
        // ======================================

        const role =
            getValue(
                user,
                [
                    "role"
                ]
            );


        setField(
            "role",
            role || "Student"
        );


        // ======================================
        // LOAD GOAL
        // ======================================

        await loadGoal();


        // ======================================
        // CLEAR MESSAGE
        // ======================================

        if (message) {

            message.textContent =
                "";

        }


        console.log(
            "Profile loaded successfully"
        );


    }

    catch (error) {

        console.error(
            "Profile Load Error:",
            error
        );


        if (message) {

            message.textContent =
                "Unable to load profile.";

            message.style.color =
                "red";

        }

    }

}


// ==========================================
// LOAD GOAL
// ==========================================

async function loadGoal() {

    try {

        // ======================================
        // GET GOAL
        // ======================================

        const goalResponse =
            await fetch(
                GOAL_API,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const goalData =
            await goalResponse.json();


        console.log(
            "Goal Data:",
            goalData
        );


        if (!goalResponse.ok) {

            console.log(
                "Goal API Error:",
                goalData
            );

            return;

        }


        const goal =
            goalData.goal ||
            goalData.data ||
            goalData;


        if (!goal) {

            console.log(
                "No goal found."
            );

            return;

        }


        // ======================================
        // GOAL TYPE
        // ======================================

        let rawGoalType =
            getValue(
                goal,
                [
                    "goalType",
                    "type"
                ]
            );


        let selectedGoals =
            normalizeGoalTypes(
                rawGoalType
            );


        let displayGoalType =
            "";


        if (
            Array.isArray(rawGoalType)
        ) {

            displayGoalType =
                rawGoalType.join(
                    ", "
                );

        }

        else {

            displayGoalType =
                String(
                    rawGoalType || ""
                );

        }


        setField(
            "goalType",
            displayGoalType
        );


        // ======================================
        // SHOW / HIDE SECTIONS
        // ======================================

        updateGoalSections(
            goal
        );


        // ======================================
        // ACADEMIC DETAILS
        // ======================================

        const course =
            getValue(
                goal,
                [
                    "course",
                    "courseName"
                ]
            );


        const year =
            getValue(
                goal,
                [
                    "year",
                    "academicYear",
                    "studyYear"
                ]
            );


        const semester =
            getValue(
                goal,
                [
                    "semester"
                ]
            );


        const college =
            getValue(
                goal,
                [
                    "college",
                    "collegeName"
                ]
            );


        // ======================================
        // COURSE
        // ======================================

        setField(
            "course",
            course
        );


        // ======================================
        // YEAR
        // ======================================

        setField(
            "year",
            year
        );


        // ======================================
        // SEMESTER
        // ======================================

        setField(
            "semester",
            semester
        );


        // ======================================
        // COLLEGE
        // ======================================

        setField(
            "college",
            college
        );


        // ======================================
        // SUBJECTS
        // ======================================

        let subjects =
            getValue(
                goal,
                [
                    "subjects",
                    "subjectList"
                ]
            );


        if (
            Array.isArray(subjects)
        ) {

            subjects =
                subjects.join(
                    ", "
                );

        }


        setField(
            "subjects",
            subjects
        );


        // ======================================
        // ACADEMIC DETAILS
        // ======================================

        const academicDetailsElement =
            document.getElementById(
                "academicDetails"
            );


        if (academicDetailsElement) {

            const academicParts = [];


            if (course) {

                academicParts.push(
                    course
                );

            }


            if (year) {

                academicParts.push(
                    "Year " + year
                );

            }


            if (semester) {

                academicParts.push(
                    "Semester " + semester
                );

            }


            if (college) {

                academicParts.push(
                    college
                );


            }


            academicDetailsElement.textContent =
                academicParts.length > 0
                    ? academicParts.join(
                        " • "
                    )
                    : "—";

        }


        // ======================================
        // COMPETITIVE EXAM
        // ======================================

        const examName =
            getValue(
                goal,
                [
                    "examName",
                    "competitiveExam",
                    "exam"
                ]
            );


        const examGroup =
            getValue(
                goal,
                [
                    "examGroup",
                    "group",
                    "level"
                ]
            );


        let competitiveExam =
            "";


        if (examName) {

            competitiveExam =
                examName;

        }


        if (examGroup) {

            if (competitiveExam) {

                competitiveExam +=
                    " - ";

            }


            competitiveExam +=
                examGroup;

        }


        setField(
            "targetExam",
            competitiveExam
        );


        // ======================================
        // TARGET ATTEMPT
        // ======================================

        const targetAttempt =
            getValue(
                goal,
                [
                    "targetAttempt",
                    "targetYear",
                    "attemptYear"
                ]
            );


        setField(
            "targetAttempt",
            targetAttempt
        );


        // ======================================
        // ELIGIBILITY
        // ======================================

        const eligibility =
            getValue(
                goal,
                [
                    "eligibility",
                    "eligibilityStatus"
                ]
            );


        setField(
            "eligibility",
            eligibility
        );


        // ======================================
        // DAILY STUDY HOURS
        // ======================================

        const dailyStudyHours =
            getValue(
                goal,
                [
                    "dailyStudyHours",
                    "studyHours",
                    "dailyHours"
                ]
            );


        let studyHoursText =
            "";


        if (
            dailyStudyHours !== "" &&
            dailyStudyHours !== null &&
            dailyStudyHours !== undefined
        ) {

            studyHoursText =
                dailyStudyHours +
                " hours";

        }


        setField(
            "dailyStudyHours",
            studyHoursText
        );


        // ======================================
        // LEARNING LEVEL
        // ======================================

        const learningLevel =
            getValue(
                goal,
                [
                    "learningLevel"
                ]
            );


        setField(
            "learningLevel",
            learningLevel
        );


        // ======================================
        // PREFERRED LANGUAGE
        // ======================================

        const preferredLanguage =
            getValue(
                goal,
                [
                    "preferredLanguage",
                    "language"
                ]
            );


        setField(
            "preferredLanguage",
            preferredLanguage
        );


        console.log(
            "Goal displayed successfully"
        );


    }

    catch (error) {

        console.error(
            "Goal Load Error:",
            error
        );

    }

}


// ==========================================
// SAVE PROFILE
// ==========================================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ======================================
            // NAME
            // ======================================

            const nameField =
                document.getElementById(
                    "name"
                );


            const name =
                nameField
                    ? nameField.value.trim()
                    : "";


            // ======================================
            // VALIDATION
            // ======================================

            if (!name) {

                if (message) {

                    message.textContent =
                        "Please enter your name.";

                    message.style.color =
                        "red";

                }

                return;

            }


            // ======================================
            // SAVE
            // ======================================

            try {

                if (message) {

                    message.textContent =
                        "Saving profile...";

                    message.style.color =
                        "#444";

                }


                const response =
                    await fetch(
                        PROFILE_API,
                        {
                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name

                                })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Profile Save Response:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Profile save failed"
                    );

                }


                // ======================================
                // UPDATE LOCAL STORAGE
                // ======================================

                if (data.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );

                }


                // ======================================
                // SUCCESS MESSAGE
                // ======================================

                if (message) {

                    message.textContent =
                        "Profile saved successfully!";

                    message.style.color =
                        "green";

                }

            }

            catch (error) {

                console.error(
                    "Profile Save Error:",
                    error
                );


                if (message) {

                    message.textContent =
                        error.message ||
                        "Profile save failed.";

                    message.style.color =
                        "red";

                }

            }

        }
    );

}


// ==========================================
// BACK TO DASHBOARD
// ==========================================

function goDashboard() {

    window.location.href =
        "dashboard.html";

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadProfile();