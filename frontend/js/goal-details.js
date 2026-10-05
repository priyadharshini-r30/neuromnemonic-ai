const API_URL = "http://localhost:5000";


// ==========================================
// AUTHENTICATION
// ==========================================

const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "login.html";
}


// ==========================================
// GET SELECTED GOAL TYPE
// ==========================================

const selectedGoalType =
    localStorage.getItem(
        "selectedGoalType"
    );


if (!selectedGoalType) {

    window.location.href =
        "goal-setup.html";
}


// ==========================================
// ELEMENTS
// ==========================================

const academicSection =
    document.getElementById(
        "academicSection"
    );

const competitiveSection =
    document.getElementById(
        "competitiveSection"
    );

const goalSubtitle =
    document.getElementById(
        "goalSubtitle"
    );

const goalForm =
    document.getElementById(
        "goalForm"
    );

const message =
    document.getElementById(
        "message"
    );

const subjectInputs =
    document.getElementById(
        "subjectInputs"
    );

const examName =
    document.getElementById(
        "examName"
    );

const examGroup =
    document.getElementById(
        "examGroup"
    );

const targetAttempt =
    document.getElementById(
        "targetAttempt"
    );

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


// ==========================================
// VARIABLES
// ==========================================

let userProfile = null;

let verifiedExamSchedule = null;


// ==========================================
// SELECTED GOALS
// ==========================================

const academicSelected =
    selectedGoalType === "Academic" ||
    selectedGoalType === "Both";


const competitiveSelected =
    selectedGoalType === "Competitive Exam" ||
    selectedGoalType === "Both";


// ==========================================
// OFFICIAL EXAM SOURCE
// ==========================================

function getOfficialExamSource(examName) {

    const exam =
        String(examName || "")
            .trim()
            .toLowerCase();


    // --------------------------------------
    // TNPSC
    // --------------------------------------

    if (exam === "tnpsc") {

        return "https://www.tnpsc.gov.in/";
    }


    // --------------------------------------
    // UPSC
    // --------------------------------------

    if (exam === "upsc") {

        return "https://upsc.gov.in/";
    }


    // --------------------------------------
    // SSC
    // --------------------------------------

    if (exam === "ssc") {

        return "https://ssc.gov.in/";
    }


    // --------------------------------------
    // BANKING
    // --------------------------------------

    if (exam === "banking") {

        return "https://www.ibps.in/";
    }


    // --------------------------------------
    // RAILWAY
    // --------------------------------------

    if (exam === "railway") {

        return "https://indianrailways.gov.in/";
    }


    return "";
}


// ==========================================
// SET OFFICIAL SOURCE LINK
// ==========================================

function setOfficialSource(
    examName,
    databaseSource
) {

    const source =
        databaseSource ||
        getOfficialExamSource(
            examName
        );


    if (
        source &&
        source !== "#"
    ) {

        sourceLink.href =
            source;

        sourceLink.textContent =
            "Official Source ↗";

        sourceLink.target =
            "_blank";

        sourceLink.rel =
            "noopener noreferrer";

        sourceLink.style.pointerEvents =
            "auto";

    }

    else {

        sourceLink.href =
            "#";

        sourceLink.textContent =
            "Official Source unavailable";

        sourceLink.removeAttribute(
            "target"
        );

        sourceLink.style.pointerEvents =
            "none";
    }
}


// ==========================================
// SETUP PAGE
// ==========================================

function setupPage() {


    // --------------------------------------
    // ACADEMIC
    // --------------------------------------

    if (academicSelected) {

        academicSection.classList.remove(
            "hidden"
        );

    }

    else {

        academicSection.classList.add(
            "hidden"
        );
    }


    // --------------------------------------
    // COMPETITIVE
    // --------------------------------------

    if (competitiveSelected) {

        competitiveSection.classList.remove(
            "hidden"
        );

    }

    else {

        competitiveSection.classList.add(
            "hidden"
        );
    }


    // --------------------------------------
    // SUBTITLE
    // --------------------------------------

    if (
        selectedGoalType === "Academic"
    ) {

        goalSubtitle.textContent =
            "Enter your academic learning details.";

    }

    else if (
        selectedGoalType === "Competitive Exam"
    ) {

        goalSubtitle.textContent =
            "Enter your competitive examination details.";

    }

    else {

        goalSubtitle.textContent =
            "Enter your academic and competitive examination details.";
    }


    // --------------------------------------
    // CREATE ACADEMIC FIELDS
    // --------------------------------------

    createAcademicFields();
}


// ==========================================
// CREATE ACADEMIC FIELDS
// ==========================================

function createAcademicFields() {

    const academicFields =
        document.getElementById(
            "academicFields"
        );


    if (!academicFields) {

        return;
    }


    if (!academicSelected) {

        academicFields.innerHTML =
            "";

        return;
    }


    academicFields.innerHTML = `

        <div class="form-group">

            <label for="educationQualification">
                Education Qualification
            </label>

            <input
                type="text"
                id="educationQualification"
                readonly
            >

            <small class="helper-text">
                This qualification was provided during registration.
            </small>

        </div>


        <div class="form-group">

            <label for="studentClass">
                Class
            </label>

            <select id="studentClass">

                <option value="">
                    Select class
                </option>

                <option value="10th">
                    10th
                </option>

                <option value="11th">
                    11th
                </option>

                <option value="12th">
                    12th
                </option>

                <option value="UG">
                    Undergraduate
                </option>

                <option value="PG">
                    Postgraduate
                </option>

            </select>

        </div>


        <div class="form-group">

            <label for="schoolName">
                School / College Name
            </label>

            <input
                type="text"
                id="schoolName"
                placeholder="Enter your school or college name"
            >

        </div>


        <div class="form-group">

            <label for="subjectCount">
                How many subjects do you have?
            </label>

            <input
                type="number"
                id="subjectCount"
                min="1"
                max="20"
                placeholder="Example: 5"
            >

            <small class="helper-text">
                Enter the number of subjects you are studying.
            </small>

        </div>


        <div class="form-group">

            <label for="academicExamDate">
                Academic Exam Date
            </label>

            <input
                type="date"
                id="academicExamDate"
            >

        </div>

    `;


    // --------------------------------------
    // SUBJECT COUNT EVENT
    // --------------------------------------

    const countField =
        document.getElementById(
            "subjectCount"
        );


    if (countField) {

        countField.addEventListener(
            "input",
            generateSubjectInputs
        );
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

                    method: "GET",

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


        userProfile =
            data.user || data;


        console.log(
            "User Profile:",
            userProfile
        );


        // --------------------------------------
        // EDUCATION
        // --------------------------------------

        const educationField =
            document.getElementById(
                "educationQualification"
            );


        if (
            educationField &&
            userProfile.educationQualification
        ) {

            educationField.value =
                userProfile.educationQualification;
        }


        // --------------------------------------
        // CLASS
        // --------------------------------------

        const classField =
            document.getElementById(
                "studentClass"
            );


        if (
            classField &&
            userProfile.educationQualification
        ) {

            const education =
                String(
                    userProfile.educationQualification
                ).toLowerCase();


            if (
                education.includes("10th")
            ) {

                classField.value =
                    "10th";

            }

            else if (
                education.includes("12th")
            ) {

                classField.value =
                    "12th";

            }

            else if (
                education.includes("ug") ||
                education.includes("degree") ||
                education.includes("b.sc") ||
                education.includes("bca") ||
                education.includes("b.com")
            ) {

                classField.value =
                    "UG";

            }

            else if (
                education.includes("pg")
            ) {

                classField.value =
                    "PG";
            }
        }

    }

    catch (error) {

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

    const subjectCount =
        document.getElementById(
            "subjectCount"
        );


    if (!subjectCount) {

        return;
    }


    const count =
        Number(
            subjectCount.value
        );


    subjectInputs.innerHTML =
        "";


    if (
        !count ||
        count < 1
    ) {

        return;
    }


    if (
        count > 20
    ) {

        message.textContent =
            "You can enter a maximum of 20 subjects.";

        return;
    }


    message.textContent =
        "";


    for (
        let i = 1;
        i <= count;
        i++
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


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


        subjectInputs.appendChild(
            wrapper
        );
    }
}


// ==========================================
// LOAD VERIFIED EXAM SCHEDULE
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

            verifiedExamSchedule =
                null;


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


            // IMPORTANT:
            // Even when database data is unavailable,
            // show the correct official exam website.

            setOfficialSource(
                selectedExam,
                ""
            );


            verifiedDate.textContent =
                "";


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

        verifiedExamSchedule =
            data;


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


        calculateEligibility(
            data
        );


        // ======================================
        // OFFICIAL SOURCE
        // ======================================

        setOfficialSource(
            selectedExam,
            data.sourceUrl
        );


        // ======================================
        // LAST VERIFIED
        // ======================================

        if (data.lastVerified) {

            verifiedDate.textContent =
                "Last verified: " +
                formatDate(
                    data.lastVerified
                );

        }

        else {

            verifiedDate.textContent =
                "";
        }


        scheduleMessage.textContent =
            "✓ Verified exam data found.";


        examScheduleSection.classList.remove(
            "hidden"
        );


        return true;

    }

    catch (error) {

        console.error(
            "Exam Schedule Error:",
            error
        );


        verifiedExamSchedule =
            null;


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


        // --------------------------------------
        // FALLBACK OFFICIAL SOURCE
        // --------------------------------------

        setOfficialSource(
            selectedExam,
            ""
        );


        verifiedDate.textContent =
            "";


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


    let ageEligible =
        true;


    if (
        exam.minimumAge !== null &&
        exam.minimumAge !== undefined
    ) {

        if (
            age === null ||
            age < exam.minimumAge
        ) {

            ageEligible =
                false;
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

            ageEligible =
                false;
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

    }

    else {

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

    verifiedExamSchedule =
        null;


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


    sourceLink.href =
        "#";


    sourceLink.textContent =
        "Official Source";


    sourceLink.removeAttribute(
        "target"
    );


    sourceLink.style.pointerEvents =
        "auto";


    verifiedDate.textContent =
        "";


    scheduleMessage.textContent =
        "";
}


// ==========================================
// EXAM EVENTS
// ==========================================

if (examName) {

    examName.addEventListener(
        "change",
        loadExamSchedule
    );
}


if (examGroup) {

    examGroup.addEventListener(
        "input",
        loadExamSchedule
    );
}


if (targetAttempt) {

    targetAttempt.addEventListener(
        "input",
        loadExamSchedule
    );
}


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


        // ======================================
        // DAILY STUDY HOURS
        // ======================================

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


        // ======================================
        // ACADEMIC VARIABLES
        // ======================================

        let educationQualification =
            "";

        let studentClass =
            "";

        let schoolName =
            "";

        let academicExamDate =
            "";

        let academicSubjects =
            [];


        // ======================================
        // COLLECT ACADEMIC DATA
        // ======================================

        if (academicSelected) {

            const educationField =
                document.getElementById(
                    "educationQualification"
                );


            const classField =
                document.getElementById(
                    "studentClass"
                );


            const schoolField =
                document.getElementById(
                    "schoolName"
                );


            const examDateField =
                document.getElementById(
                    "academicExamDate"
                );


            educationQualification =
                educationField
                    ? educationField.value.trim()
                    : "";


            studentClass =
                classField
                    ? classField.value.trim()
                    : "";


            schoolName =
                schoolField
                    ? schoolField.value.trim()
                    : "";


            academicExamDate =
                examDateField
                    ? examDateField.value
                    : "";


            academicSubjects =
                collectSubjects();


            // ----------------------------------
            // VALIDATION
            // ----------------------------------

            const subjectCountField =
                document.getElementById(
                    "subjectCount"
                );


            const subjectCount =
                subjectCountField
                    ? Number(
                        subjectCountField.value
                    )
                    : 0;


            if (
                !educationQualification
            ) {

                message.textContent =
                    "Education qualification is required.";

                return;
            }


            if (
                !studentClass
            ) {

                message.textContent =
                    "Please select your class.";

                return;
            }


            if (
                !schoolName
            ) {

                message.textContent =
                    "Please enter your school or college name.";

                return;
            }


            if (
                !subjectCount ||
                subjectCount < 1 ||
                subjectCount > 20
            ) {

                message.textContent =
                    "Please enter the number of subjects between 1 and 20.";

                return;
            }


            if (
                academicSubjects.length !==
                subjectCount
            ) {

                message.textContent =
                    "Please enter all subject names.";

                return;
            }


            if (
                !academicExamDate
            ) {

                message.textContent =
                    "Please select your academic examination date.";

                return;
            }
        }


        // ======================================
        // COMPETITIVE VARIABLES
        // ======================================

        let selectedExam =
            "";

        let selectedGroup =
            "";

        let preparationLevel =
            "";

        let selectedYear =
            "";


        // ======================================
        // COLLECT COMPETITIVE DATA
        // ======================================

        if (competitiveSelected) {

            selectedExam =
                examName.value.trim();


            selectedGroup =
                examGroup.value.trim();


            const preparationField =
                document.getElementById(
                    "preparationLevel"
                );


            preparationLevel =
                preparationField
                    ? preparationField.value
                    : "";


            selectedYear =
                targetAttempt.value.trim();


            // ----------------------------------
            // VALIDATION
            // ----------------------------------

            if (
                !selectedExam
            ) {

                message.textContent =
                    "Please select an examination.";

                return;
            }


            if (
                !selectedGroup
            ) {

                message.textContent =
                    "Please enter the exam group or level.";

                return;
            }


            if (
                !preparationLevel
            ) {

                message.textContent =
                    "Please select your preparation level.";

                return;
            }


            if (
                !selectedYear
            ) {

                message.textContent =
                    "Please enter your target attempt year.";

                return;
            }


            // ----------------------------------
            // CHECK VERIFIED DATA
            // ----------------------------------

            await loadExamSchedule();
        }


        // ======================================
        // GOAL TYPE
        // ======================================

        let goalType = [];


        if (
            selectedGoalType === "Both"
        ) {

            goalType = [
                "Academic",
                "Competitive Exam"
            ];

        }

        else {

            goalType = [
                selectedGoalType
            ];
        }


        // ======================================
        // FINAL GOAL DATA
        // ======================================

        const goalData = {

            goalType:
                goalType,


            // ----------------------------------
            // ACADEMIC
            // ----------------------------------

            educationQualification:
                academicSelected
                    ? educationQualification
                    : "",


            studentClass:
                academicSelected
                    ? studentClass
                    : "",


            schoolName:
                academicSelected
                    ? schoolName
                    : "",


            subjects:
                academicSelected
                    ? academicSubjects
                    : [],


            academicExamDate:
                academicSelected
                    ? academicExamDate
                    : null,


            // ----------------------------------
            // COMPETITIVE
            // ----------------------------------

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


            // ----------------------------------
            // COMMON
            // ----------------------------------

            dailyStudyHours:
                dailyStudyHours
        };


        console.log(
            "Final Goal Data:",
            goalData
        );


        // ======================================
        // SAVE TO BACKEND
        // ======================================

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


            console.log(
                "Goal Save Response:",
                data
            );


            // ==================================
            // SAVE FAILED
            // ==================================

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Failed to save your goal.";

                console.error(
                    "Goal Save Error:",
                    data
                );

                return;
            }


            // ==================================
            // SAVE SUCCESS
            // ==================================

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
            // GO TO DASHBOARD
            // ==================================

            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                800
            );

        }


        catch (error) {

            console.error(
                "Goal Save Error:",
                error
            );


            message.textContent =
                "Unable to connect to the server. Please make sure the backend is running.";
        }

    }
);


// ==========================================
// BACK BUTTON
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