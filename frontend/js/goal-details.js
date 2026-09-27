const API_URL = "http://localhost:5000";

// ==========================================
// AUTHENTICATION
// ==========================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ==========================================
// GET SELECTED GOAL
// ==========================================

const selectedGoalType =
    localStorage.getItem("selectedGoalType");

if (!selectedGoalType) {
    window.location.href = "goal-setup.html";
}


// ==========================================
// ELEMENTS
// ==========================================

const academicSection =
    document.getElementById("academicSection");

const competitiveSection =
    document.getElementById("competitiveSection");

const goalSubtitle =
    document.getElementById("goalSubtitle");

const goalForm =
    document.getElementById("goalForm");

const message =
    document.getElementById("message");

const subjectCount =
    document.getElementById("subjectCount");

const subjectInputs =
    document.getElementById("subjectInputs");

const examName =
    document.getElementById("examName");

const examGroup =
    document.getElementById("examGroup");

const targetAttempt =
    document.getElementById("targetAttempt");

const examScheduleSection =
    document.getElementById("examScheduleSection");

const notificationDate =
    document.getElementById("notificationDate");

const examDate =
    document.getElementById("examDate");

const availableDays =
    document.getElementById("availableDays");

const minimumAge =
    document.getElementById("minimumAge");

const maximumAge =
    document.getElementById("maximumAge");

const requiredEducation =
    document.getElementById("requiredEducation");

const eligibilityStatus =
    document.getElementById("eligibilityStatus");

const sourceLink =
    document.getElementById("sourceLink");

const verifiedDate =
    document.getElementById("verifiedDate");

const scheduleMessage =
    document.getElementById("scheduleMessage");


// ==========================================
// VARIABLES
// ==========================================

let verifiedExamSchedule = null;

let userProfile = null;

let subjects = [];


// ==========================================
// DETERMINE SELECTED GOALS
// ==========================================

const academicSelected =
    selectedGoalType === "Academic" ||
    selectedGoalType === "Both";

const competitiveSelected =
    selectedGoalType === "Competitive Exam" ||
    selectedGoalType === "Both";


// ==========================================
// SETUP PAGE
// ==========================================

function setupPage() {

    // Academic section

    if (academicSelected) {

        academicSection.classList.remove("hidden");

    } else {

        academicSection.classList.add("hidden");
    }


    // Competitive section

    if (competitiveSelected) {

        competitiveSection.classList.remove("hidden");

    } else {

        competitiveSection.classList.add("hidden");
    }


    // Subtitle

    if (selectedGoalType === "Academic") {

        goalSubtitle.textContent =
            "Enter your academic learning details.";

    } else if (selectedGoalType === "Competitive Exam") {

        goalSubtitle.textContent =
            "Enter your competitive examination details.";

    } else {

        goalSubtitle.textContent =
            "Enter your academic and competitive examination details.";
    }
}


// ==========================================
// LOAD USER PROFILE
// ==========================================

async function loadUserProfile() {

    try {

        const response =
            await fetch(
                API_URL + "/api/profile",
                {
                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Profile Error:",
                data.message
            );

            return;
        }


        userProfile = data;

        console.log(
            "User profile loaded successfully."
        );

    } catch (error) {

        console.error(
            "Profile Load Error:",
            error
        );
    }
}


// ==========================================
// GENERATE SUBJECT INPUTS
// ==========================================

function generateSubjectInputs() {

    const count =
        Number(subjectCount.value);


    subjectInputs.innerHTML = "";

    subjects = [];


    if (!count || count < 1) {

        return;
    }


    if (count > 20) {

        message.textContent =
            "You can enter a maximum of 20 subjects.";

        return;
    }


    message.textContent = "";


    for (
        let i = 1;
        i <= count;
        i++
    ) {

        const wrapper =
            document.createElement("div");


        wrapper.className =
            "form-group";


        wrapper.innerHTML = `
            <label for="subject${i}">
                Subject ${i}
            </label>

            <input
                type="text"
                id="subject${i}"
                class="subject-name"
                placeholder="Enter subject ${i}"
            >
        `;


        subjectInputs.appendChild(wrapper);
    }
}


// ==========================================
// SUBJECT COUNT EVENT
// ==========================================

subjectCount.addEventListener(
    "input",
    generateSubjectInputs
);


// ==========================================
// LOAD EXAM SCHEDULE
// ==========================================

async function loadExamSchedule() {

    if (!competitiveSelected) {

        return false;
    }


    const selectedExam =
        examName.value.trim();

    const selectedGroup =
        examGroup.value.trim();

    const selectedYear =
        targetAttempt.value.trim();


    if (
        !selectedExam ||
        !selectedGroup ||
        !selectedYear
    ) {

        resetExamSchedule();

        return false;
    }


    scheduleMessage.textContent =
        "Checking verified exam data...";


    examScheduleSection.classList.add(
        "hidden"
    );


    try {

        const query =
            new URLSearchParams({

                examName:
                    selectedExam,

                examGroup:
                    selectedGroup,

                attemptYear:
                    selectedYear
            });


        const response =
            await fetch(
                API_URL +
                "/api/exams/search?" +
                query.toString()
            );


        const data =
            await response.json();


        // ======================================
        // NO VERIFIED DATA
        // ======================================

        if (!response.ok) {

            verifiedExamSchedule = null;


            notificationDate.textContent =
                "Not announced";

            examDate.textContent =
                "Not announced";

            availableDays.textContent =
                "Not announced";

            minimumAge.textContent =
                "Not verified";

            maximumAge.textContent =
                "Not verified";

            requiredEducation.textContent =
                "Not verified";

            eligibilityStatus.textContent =
                "Not Verified";


            sourceLink.href = "#";

            sourceLink.textContent =
                "Official Source";


            verifiedDate.textContent = "";


            scheduleMessage.textContent =
                "Official examination schedule has not been announced or verified for this attempt year.";


            examScheduleSection.classList.remove(
                "hidden"
            );


            return false;
        }


        // ======================================
        // VERIFIED DATA FOUND
        // ======================================

        verifiedExamSchedule = data;


        notificationDate.textContent =
            formatDate(
                data.notificationDate
            );


        examDate.textContent =
            formatDate(
                data.examDate
            );


        availableDays.textContent =
            data.availableDays !== null &&
            data.availableDays !== undefined
                ? data.availableDays + " days"
                : "Not announced";


        minimumAge.textContent =
            data.minimumAge !== null &&
            data.minimumAge !== undefined
                ? data.minimumAge + " years"
                : "Not specified";


        maximumAge.textContent =
            data.maximumAge !== null &&
            data.maximumAge !== undefined
                ? data.maximumAge + " years"
                : "No maximum specified";


        requiredEducation.textContent =
            data.educationQualification ||
            "Not specified";


        calculateEligibility(data);


        if (data.sourceUrl) {

            sourceLink.href =
                data.sourceUrl;

            sourceLink.textContent =
                "Official Source";

        } else {

            sourceLink.href = "#";

            sourceLink.textContent =
                "Source unavailable";
        }


        if (data.lastVerified) {

            verifiedDate.textContent =
                "Last verified: " +
                formatDate(
                    data.lastVerified
                );

        } else {

            verifiedDate.textContent = "";
        }


        scheduleMessage.textContent =
            "✓ Verified exam data found.";


        examScheduleSection.classList.remove(
            "hidden"
        );


        return true;


    } catch (error) {

        console.error(
            "Exam Schedule Error:",
            error
        );


        verifiedExamSchedule = null;


        notificationDate.textContent =
            "Not available";

        examDate.textContent =
            "Not available";

        availableDays.textContent =
            "Not available";

        minimumAge.textContent =
            "Not verified";

        maximumAge.textContent =
            "Not verified";

        requiredEducation.textContent =
            "Not verified";

        eligibilityStatus.textContent =
            "Not Verified";


        scheduleMessage.textContent =
            "Unable to verify exam schedule. You can still save your goal.";


        examScheduleSection.classList.remove(
            "hidden"
        );


        return false;
    }
}


// ==========================================
// CALCULATE ELIGIBILITY
// ==========================================

function calculateEligibility(exam) {

    if (!userProfile) {

        eligibilityStatus.textContent =
            "Profile data unavailable";

        return;
    }


    const age =
        calculateAge(
            userProfile.dateOfBirth
        );


    let ageEligible = true;


    if (
        exam.minimumAge !== null &&
        exam.minimumAge !== undefined
    ) {

        if (
            age === null ||
            age < exam.minimumAge
        ) {

            ageEligible = false;
        }
    }


    if (
        exam.maximumAge !== null &&
        exam.maximumAge !== undefined
    ) {

        if (
            age === null ||
            age > exam.maximumAge
        ) {

            ageEligible = false;
        }
    }


    const educationEligible =
        checkEducationEligibility(
            userProfile.educationQualification,
            exam.educationQualification
        );


    if (
        ageEligible &&
        educationEligible
    ) {

        eligibilityStatus.textContent =
            "✓ Eligible";

    } else {

        eligibilityStatus.textContent =
            "✗ Not Eligible";
    }
}


// ==========================================
// CALCULATE AGE
// ==========================================

function calculateAge(dateOfBirth) {

    if (!dateOfBirth) {

        return null;
    }


    const dob =
        new Date(dateOfBirth);

    const today =
        new Date();


    if (
        isNaN(
            dob.getTime()
        )
    ) {

        return null;
    }


    let age =
        today.getFullYear() -
        dob.getFullYear();


    const monthDifference =
        today.getMonth() -
        dob.getMonth();


    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() < dob.getDate()
        )
    ) {

        age--;
    }


    return age;
}


// ==========================================
// EDUCATION ELIGIBILITY
// ==========================================

function checkEducationEligibility(
    userEducation,
    requiredEducation
) {

    if (!requiredEducation) {

        return true;
    }


    const user =
        String(
            userEducation || ""
        ).toLowerCase();


    const required =
        String(
            requiredEducation || ""
        ).toLowerCase();


    if (
        required.includes("degree") ||
        required.includes("graduate") ||
        required.includes("graduation")
    ) {

        return (
            user.includes("ug") ||
            user.includes("pg") ||
            user.includes("degree") ||
            user.includes("b.sc") ||
            user.includes("bca") ||
            user.includes("b.com")
        );
    }


    if (
        required.includes("12")
    ) {

        return (
            user.includes("12") ||
            user.includes("diploma") ||
            user.includes("ug") ||
            user.includes("pg")
        );
    }


    if (
        required.includes("10")
    ) {

        return true;
    }


    return true;
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "Not announced";
    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "Not available";
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


// ==========================================
// RESET EXAM SCHEDULE
// ==========================================

function resetExamSchedule() {

    verifiedExamSchedule = null;


    examScheduleSection.classList.add(
        "hidden"
    );


    notificationDate.textContent = "—";

    examDate.textContent = "—";

    availableDays.textContent = "—";

    minimumAge.textContent = "—";

    maximumAge.textContent = "—";

    requiredEducation.textContent = "—";

    eligibilityStatus.textContent = "—";


    sourceLink.href = "#";

    sourceLink.textContent =
        "Official Source";


    verifiedDate.textContent = "";

    scheduleMessage.textContent = "";
}


// ==========================================
// EXAM EVENTS
// ==========================================

examName.addEventListener(
    "change",
    loadExamSchedule
);


examGroup.addEventListener(
    "input",
    loadExamSchedule
);


targetAttempt.addEventListener(
    "input",
    loadExamSchedule
);


// ==========================================
// COLLECT SUBJECTS
// ==========================================

function collectSubjects() {

    const subjectElements =
        document.querySelectorAll(
            ".subject-name"
        );


    return Array.from(
        subjectElements
    )
        .map(
            subject =>
                subject.value.trim()
        )
        .filter(
            subject =>
                subject !== ""
        );
}


// ==========================================
// SAVE GOAL
// ==========================================

goalForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        message.textContent =
            "Checking your goal details...";


        // ==================================
        // DAILY STUDY HOURS
        // ==================================

        const dailyStudyHours =
            Number(
                document.getElementById(
                    "dailyStudyHours"
                ).value
            );


        if (
            !dailyStudyHours ||
            dailyStudyHours < 1 ||
            dailyStudyHours > 12
        ) {

            message.textContent =
                "Please enter daily study hours between 1 and 12.";

            return;
        }


        // ==================================
        // ACADEMIC DATA
        // ==================================

        let academicYear = "";

        let course = "";

        let semester = "";

        let collegeExamDate = "";

        subjects = [];


        if (academicSelected) {

            academicYear =
                document.getElementById(
                    "academicYear"
                ).value;


            course =
                document.getElementById(
                    "course"
                ).value.trim();


            semester =
                document.getElementById(
                    "semester"
                ).value;


            const subjectCountValue =
                Number(
                    subjectCount.value
                );


            subjects =
                collectSubjects();


            collegeExamDate =
                document.getElementById(
                    "collegeExamDate"
                ).value;


            if (
                !academicYear ||
                !course ||
                !semester ||
                !subjectCountValue ||
                subjectCountValue < 1 ||
                subjectCountValue > 20 ||
                subjects.length !== subjectCountValue ||
                !collegeExamDate
            ) {

                message.textContent =
                    "Please complete all Academic / College details.";

                return;
            }
        }


        // ==================================
        // COMPETITIVE DATA
        // ==================================

        let selectedExam = "";

        let selectedGroup = "";

        let preparationLevel = "";

        let selectedYear = "";


        if (competitiveSelected) {

            selectedExam =
                examName.value.trim();


            selectedGroup =
                examGroup.value.trim();


            preparationLevel =
                document.getElementById(
                    "preparationLevel"
                ).value;


            selectedYear =
                targetAttempt.value.trim();


            if (
                !selectedExam ||
                !selectedGroup ||
                !selectedYear ||
                !preparationLevel
            ) {

                message.textContent =
                    "Please complete all Competitive Exam details.";

                return;
            }


            const verified =
                await loadExamSchedule();


            if (!verified) {

                console.log(
                    "Verified exam schedule unavailable. Continuing with goal save."
                );
            }
        }


        // ==================================
        // GOAL TYPE
        // ==================================

        let goalType = [];


        if (selectedGoalType === "Both") {

            goalType = [
                "Academic",
                "Competitive Exam"
            ];

        } else {

            goalType = [
                selectedGoalType
            ];
        }


        // ==================================
        // FINAL GOAL DATA
        // ==================================

        const goalData = {

            goalType: goalType,

            academicYear:
                academicSelected
                    ? academicYear
                    : "",

            course:
                academicSelected
                    ? course
                    : "",

            semester:
                academicSelected
                    ? semester
                    : "",

            subjects:
                academicSelected
                    ? subjects
                    : [],

            collegeExamDate:
                academicSelected
                    ? collegeExamDate
                    : null,

            examName:
                competitiveSelected
                    ? selectedExam
                    : "",

            examGroup:
                competitiveSelected
                    ? selectedGroup
                    : "",

            preparationLevel:
                competitiveSelected
                    ? preparationLevel
                    : "",

            targetAttempt:
                competitiveSelected
                    ? selectedYear
                    : "",

            dailyStudyHours:
                dailyStudyHours
        };


        console.log(
            "Final Goal Data:",
            goalData
        );


        // ==================================
        // SAVE TO BACKEND
        // ==================================

        try {

            message.textContent =
                "Saving your goals...";


            const response =
                await fetch(
                    API_URL +
                    "/api/goals",
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body:
                            JSON.stringify(
                                goalData
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Failed to save goals.";


                console.error(
                    "Goal Save Error:",
                    data
                );


                return;
            }


            message.textContent =
                "Goal saved successfully!";


            console.log(
                "Saved Goal:",
                data.goal
            );


            // ==================================
            // REMOVE TEMPORARY SELECTION
            // ==================================

            localStorage.removeItem(
                "selectedGoalType"
            );


            // ==================================
            // GO TO ROADMAP
            // ==================================

            setTimeout(
                function () {

                    window.location.href =
                        "roadmap.html";

                },
                1000
            );


        } catch (error) {

            console.error(
                "Goal Save Error:",
                error
            );


            message.textContent =
                "Unable to connect to the server.";
        }
    }
);


// ==========================================
// BACK TO GOAL SETUP
// ==========================================

function goBack() {

    window.location.href =
        "goal-setup.html";
}


// ==========================================
// INITIAL LOAD
// ==========================================

setupPage();

loadUserProfile();