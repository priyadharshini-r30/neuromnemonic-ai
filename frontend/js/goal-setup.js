const API_URL = "http://localhost:5000";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ===============================
// ELEMENTS
// ===============================

const academicGoal =
    document.getElementById("academicGoal");

const competitiveGoal =
    document.getElementById("competitiveGoal");

const academicSection =
    document.getElementById("academicSection");

const competitiveSection =
    document.getElementById("competitiveSection");

const commonSection =
    document.getElementById("commonSection");

const goalForm =
    document.getElementById("goalForm");

const message =
    document.getElementById("message");

const examName =
    document.getElementById("examName");

const examGroup =
    document.getElementById("examGroup");

const targetAttempt =
    document.getElementById("targetAttempt");

const examScheduleSection =
    document.getElementById(
        "examScheduleSection"
    );

const notificationDate =
    document.getElementById(
        "notificationDate"
    );

const examDate =
    document.getElementById(
        "examDate"
    );

const availableDays =
    document.getElementById(
        "availableDays"
    );

const minimumAge =
    document.getElementById(
        "minimumAge"
    );

const maximumAge =
    document.getElementById(
        "maximumAge"
    );

const requiredEducation =
    document.getElementById(
        "requiredEducation"
    );

const eligibilityStatus =
    document.getElementById(
        "eligibilityStatus"
    );

const sourceLink =
    document.getElementById(
        "sourceLink"
    );

const verifiedDate =
    document.getElementById(
        "verifiedDate"
    );

const scheduleMessage =
    document.getElementById(
        "scheduleMessage"
    );


// ===============================
// VARIABLES
// ===============================

let verifiedExamSchedule = null;
let userProfile = null;


// ===============================
// LOAD USER PROFILE
// ===============================

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
            "Profile loaded successfully"
        );

    } catch (error) {

        console.error(
            "Profile Load Error:",
            error
        );
    }
}


// ===============================
// UPDATE GOAL SECTIONS
// ===============================

function updateSections() {

    const academicSelected =
        academicGoal.checked;

    const competitiveSelected =
        competitiveGoal.checked;


    academicSection.classList.add(
        "hidden"
    );

    competitiveSection.classList.add(
        "hidden"
    );

    commonSection.classList.add(
        "hidden"
    );


    if (academicSelected) {

        academicSection.classList.remove(
            "hidden"
        );
    }


    if (competitiveSelected) {

        competitiveSection.classList.remove(
            "hidden"
        );
    }


    if (
        academicSelected ||
        competitiveSelected
    ) {

        commonSection.classList.remove(
            "hidden"
        );
    }


    if (!competitiveSelected) {

        resetExamSchedule();
    }
}


// ===============================
// GOAL CHECKBOX EVENTS
// ===============================

academicGoal.addEventListener(
    "change",
    updateSections
);

competitiveGoal.addEventListener(
    "change",
    updateSections
);


// ===============================
// LOAD EXAM SCHEDULE
// ===============================

async function loadExamSchedule() {

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


        // =====================================
        // NO VERIFIED SCHEDULE
        // =====================================

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

            eligibilityStatus.style.color =
                "#d97706";


            sourceLink.href =
                "#";

            sourceLink.textContent =
                "Official Source";


            verifiedDate.textContent =
                "";


            scheduleMessage.textContent =
                "Official examination schedule has not been announced or verified for this attempt year.";


            // IMPORTANT:
            // Show the section even when
            // schedule is unavailable.

            examScheduleSection.classList.remove(
                "hidden"
            );


            // IMPORTANT:
            // Return false only for information.
            // It will NOT block Save Goal.

            return false;
        }


        // =====================================
        // VERIFIED SCHEDULE FOUND
        // =====================================

        verifiedExamSchedule = data;


        notificationDate.textContent =
            formatDate(
                data.notificationDate
            );


        examDate.textContent =
            formatDate(
                data.examDate
            );


        if (
            data.availableDays !== null &&
            data.availableDays !== undefined
        ) {

            availableDays.textContent =
                data.availableDays +
                " days";

        } else {

            availableDays.textContent =
                "Not announced";
        }


        if (
            data.minimumAge !== null &&
            data.minimumAge !== undefined
        ) {

            minimumAge.textContent =
                data.minimumAge +
                " years";

        } else {

            minimumAge.textContent =
                "Not specified";
        }


        if (
            data.maximumAge !== null &&
            data.maximumAge !== undefined
        ) {

            maximumAge.textContent =
                data.maximumAge +
                " years";

        } else {

            maximumAge.textContent =
                "No maximum specified";
        }


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

            sourceLink.href =
                "#";

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

            verifiedDate.textContent =
                "";
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

        eligibilityStatus.style.color =
            "#d97706";


        scheduleMessage.textContent =
            "Unable to verify exam schedule. You can still save your goal.";


        examScheduleSection.classList.remove(
            "hidden"
        );


        return false;
    }
}


// ===============================
// CALCULATE ELIGIBILITY
// ===============================

function calculateEligibility(exam) {

    if (!userProfile) {

        eligibilityStatus.textContent =
            "Profile data unavailable";

        eligibilityStatus.style.color =
            "#dc2626";

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

        eligibilityStatus.style.color =
            "#15803d";

    } else {

        eligibilityStatus.textContent =
            "✗ Not Eligible";

        eligibilityStatus.style.color =
            "#dc2626";
    }
}


// ===============================
// CALCULATE AGE
// ===============================

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


// ===============================
// EDUCATION ELIGIBILITY
// ===============================

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


// ===============================
// FORMAT DATE
// ===============================

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


// ===============================
// RESET EXAM SCHEDULE
// ===============================

function resetExamSchedule() {

    verifiedExamSchedule = null;


    examScheduleSection.classList.add(
        "hidden"
    );


    notificationDate.textContent =
        "—";

    examDate.textContent =
        "—";

    availableDays.textContent =
        "—";

    minimumAge.textContent =
        "—";

    maximumAge.textContent =
        "—";

    requiredEducation.textContent =
        "—";

    eligibilityStatus.textContent =
        "—";

    eligibilityStatus.style.color =
        "#111827";


    sourceLink.href =
        "#";

    sourceLink.textContent =
        "Official Source";


    verifiedDate.textContent =
        "";

    scheduleMessage.textContent =
        "";
}


// ===============================
// EXAM INPUT EVENTS
// ===============================

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


// ===============================
// SAVE GOAL
// ===============================

goalForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        message.textContent =
            "Checking your goals...";


        // ============================
        // SELECTED GOALS
        // ============================

        const selectedGoals = [];


        if (
            academicGoal.checked
        ) {

            selectedGoals.push(
                "Academic"
            );
        }


        if (
            competitiveGoal.checked
        ) {

            selectedGoals.push(
                "Competitive Exam"
            );
        }


        if (
            selectedGoals.length === 0
        ) {

            message.textContent =
                "Please select at least one learning goal.";

            return;
        }


        // ============================
        // DAILY STUDY HOURS
        // ============================

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


        // ============================
        // ACADEMIC VALIDATION
        // ============================

        if (
            academicGoal.checked
        ) {

            const academicYear =
                document.getElementById(
                    "academicYear"
                ).value;


            const course =
                document.getElementById(
                    "course"
                ).value.trim();


            const semester =
                document.getElementById(
                    "semester"
                ).value;


            const subjectsText =
                document.getElementById(
                    "subjects"
                ).value.trim();


            const collegeExamDate =
                document.getElementById(
                    "collegeExamDate"
                ).value;


            if (
                !academicYear ||
                !course ||
                !semester ||
                !subjectsText ||
                !collegeExamDate
            ) {

                message.textContent =
                    "Please complete all Academic / College details.";

                return;
            }
        }


        // ============================
        // COMPETITIVE VALIDATION
        // ============================

        if (
            competitiveGoal.checked
        ) {

            const selectedExam =
                examName.value.trim();


            const selectedGroup =
                examGroup.value.trim();


            const selectedYear =
                targetAttempt.value.trim();


            const preparationLevel =
                document.getElementById(
                    "preparationLevel"
                ).value;


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


            // ======================================
            // CHECK VERIFIED DATA
            // BUT DO NOT BLOCK SAVE
            // ======================================

            const verified =
                await loadExamSchedule();


            if (!verified) {

                console.log(
                    "Verified exam schedule is not available yet. Continuing with goal save."
                );
            }
        }


        // ============================
        // SUBJECTS
        // ============================

        const subjectsText =
            document.getElementById(
                "subjects"
            ).value;


        const subjects =
            subjectsText
                .split(",")
                .map(
                    subject =>
                        subject.trim()
                )
                .filter(
                    subject =>
                        subject !== ""
                );


        // ============================
        // GOAL DATA
        // ============================

        const goalData = {

            goalType:
                selectedGoals,


            academicYear:
                academicGoal.checked
                    ? document.getElementById(
                        "academicYear"
                    ).value
                    : "",


            course:
                academicGoal.checked
                    ? document.getElementById(
                        "course"
                    ).value.trim()
                    : "",


            semester:
                academicGoal.checked
                    ? document.getElementById(
                        "semester"
                    ).value
                    : "",


            subjects:
                academicGoal.checked
                    ? subjects
                    : [],


            collegeExamDate:
                academicGoal.checked
                    ? document.getElementById(
                        "collegeExamDate"
                    ).value
                    : null,


            examName:
                competitiveGoal.checked
                    ? examName.value.trim()
                    : "",


            examGroup:
                competitiveGoal.checked
                    ? examGroup.value.trim()
                    : "",


            preparationLevel:
                competitiveGoal.checked
                    ? document.getElementById(
                        "preparationLevel"
                    ).value
                    : "",


            targetAttempt:
                competitiveGoal.checked
                    ? targetAttempt.value.trim()
                    : "",


            dailyStudyHours:
                dailyStudyHours
        };


        console.log(
            "Goal Data:",
            goalData
        );


        // ============================
        // SAVE TO BACKEND
        // ============================

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


            // ============================
            // GO TO ROADMAP
            // ============================

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


// ===============================
// BACK TO DASHBOARD
// ===============================

function goToDashboard() {

    window.location.href =
        "dashboard.html";
}


// ===============================
// INITIAL LOAD
// ===============================

loadUserProfile();

updateSections();