const express = require("express");

const Goal = require("../models/Goal");
const ExamSchedule = require("../models/ExamSchedule");
const User = require("../models/user");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// CALCULATE AGE
// ========================================

function calculateAge(dateOfBirth) {

    if (!dateOfBirth) {
        return null;
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();

    if (isNaN(dob.getTime())) {
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


// ========================================
// CHECK EDUCATION ELIGIBILITY
// ========================================

function checkEducationEligibility(
    userEducation,
    requiredEducation
) {

    if (!requiredEducation) {
        return true;
    }

    const user =
        String(userEducation || "")
            .toLowerCase()
            .trim();

    const required =
        String(requiredEducation || "")
            .toLowerCase()
            .trim();


    // Degree requirement
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


    // 12th requirement
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


    // 10th requirement
    if (
        required.includes("10")
    ) {

        return true;
    }


    return true;
}


// ========================================
// CALCULATE AVAILABLE DAYS
// ========================================

function calculateAvailableDays(
    targetDate
) {

    if (!targetDate) {
        return null;
    }

    const today = new Date();
    const examDate = new Date(targetDate);

    if (isNaN(examDate.getTime())) {
        return null;
    }

    today.setHours(
        0,
        0,
        0,
        0
    );

    examDate.setHours(
        0,
        0,
        0,
        0
    );

    const difference =
        examDate.getTime() -
        today.getTime();

    const days =
        Math.ceil(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );

    return days > 0 ? days : 0;
}


// ========================================
// CREATE / UPDATE GOAL
// ========================================

router.post(
    "/",
    protect,
    async (req, res) => {

        try {

            // ========================================
            // RECEIVE DATA
            // ========================================

            const {
                goalType,

                // Academic
                educationQualification,
                studentClass,
                schoolName,
                subjects,
                academicExamDate,

                // Competitive
                examName,
                examGroup,
                preparationLevel,
                targetAttempt,

                // Common
                dailyStudyHours

            } = req.body;


            // ========================================
            // VALIDATE GOAL TYPE
            // ========================================

            if (
                !goalType ||
                !Array.isArray(goalType) ||
                goalType.length === 0
            ) {

                return res.status(400).json({

                    message:
                        "Please select at least one learning goal."

                });
            }


            const validGoalTypes = [
                "Academic",
                "Competitive Exam"
            ];


            const invalidGoal =
                goalType.some(
                    type =>
                        !validGoalTypes.includes(type)
                );


            if (invalidGoal) {

                return res.status(400).json({

                    message:
                        "Invalid goal type."

                });
            }


            // ========================================
            // STUDY HOURS
            // ========================================

            const studyHours =
                Number(dailyStudyHours);


            if (
                isNaN(studyHours) ||
                studyHours < 1 ||
                studyHours > 12
            ) {

                return res.status(400).json({

                    message:
                        "Daily study hours must be between 1 and 12."

                });
            }


            // ========================================
            // GET USER
            // ========================================

            const user =
                await User.findById(
                    req.user._id
                );


            if (!user) {

                return res.status(404).json({

                    message:
                        "User not found."

                });
            }


            // ========================================
            // CHECK GOAL TYPES
            // ========================================

            const hasAcademicGoal =
                goalType.includes(
                    "Academic"
                );


            const hasCompetitiveGoal =
                goalType.includes(
                    "Competitive Exam"
                );


            // ========================================
            // DEFAULT VERIFIED DATA
            // ========================================

            let notificationDate = null;

            let targetDate = null;

            let sourceUrl = "";

            let lastVerified = null;

            let minimumAge = null;

            let maximumAge = null;

            let requiredEducation = "";

            let eligibility = "";

            let eligibilityReason = "";

            let availableDays = null;


            // ========================================
            // ACADEMIC GOAL
            // ========================================

            if (hasAcademicGoal) {

                // ----------------------------------------
                // VALIDATE ACADEMIC DETAILS
                // ----------------------------------------

                if (
                    !educationQualification ||
                    !educationQualification.trim()
                ) {

                    return res.status(400).json({

                        message:
                            "Please select your education qualification."

                    });
                }


                if (
                    !studentClass ||
                    !studentClass.trim()
                ) {

                    return res.status(400).json({

                        message:
                            "Please select your class."

                    });
                }


                if (
                    !schoolName ||
                    !schoolName.trim()
                ) {

                    return res.status(400).json({

                        message:
                            "Please enter your school name."

                    });
                }


                if (
                    !Array.isArray(subjects) ||
                    subjects.length === 0
                ) {

                    return res.status(400).json({

                        message:
                            "Please enter at least one subject."

                    });
                }


                // ----------------------------------------
                // CLEAN SUBJECTS
                // ----------------------------------------

                const cleanedSubjects =
                    subjects
                        .map(
                            subject =>
                                String(subject)
                                    .trim()
                        )
                        .filter(
                            subject =>
                                subject.length > 0
                        );


                if (
                    cleanedSubjects.length === 0
                ) {

                    return res.status(400).json({

                        message:
                            "Please enter valid subject names."

                    });
                }


                if (
                    cleanedSubjects.length > 20
                ) {

                    return res.status(400).json({

                        message:
                            "You can enter a maximum of 20 subjects."

                    });
                }


                // ----------------------------------------
                // ACADEMIC EXAM DATE
                // ----------------------------------------

                if (!academicExamDate) {

                    return res.status(400).json({

                        message:
                            "Academic examination date is required."

                    });
                }


                const academicDate =
                    new Date(
                        academicExamDate
                    );


                if (
                    isNaN(
                        academicDate.getTime()
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid academic examination date."

                    });
                }


                // ----------------------------------------
                // ACADEMIC DATE AS DEFAULT TARGET
                // ----------------------------------------

                targetDate =
                    academicDate;


                availableDays =
                    calculateAvailableDays(
                        targetDate
                    );


                // Replace request subjects
                // with cleaned subjects

                req.body.subjects =
                    cleanedSubjects;
            }


            // ========================================
            // COMPETITIVE EXAM GOAL
            // ========================================

            if (hasCompetitiveGoal) {

                // ----------------------------------------
                // BASIC VALIDATION
                // ----------------------------------------

                if (
                    !examName ||
                    !examName.trim()
                ) {

                    return res.status(400).json({

                        message:
                            "Please select an examination."

                    });
                }


                if (
                    !examGroup ||
                    !examGroup.trim()
                ) {

                    return res.status(400).json({

                        message:
                            "Please enter the exam group or level."

                    });
                }


                if (
                    !preparationLevel
                ) {

                    return res.status(400).json({

                        message:
                            "Please select your preparation level."

                    });
                }


                if (
                    !targetAttempt
                ) {

                    return res.status(400).json({

                        message:
                            "Please enter your target attempt year."

                    });
                }


                const attemptYear =
                    Number(targetAttempt);


                if (
                    isNaN(attemptYear) ||
                    attemptYear < 2026 ||
                    attemptYear > 2100
                ) {

                    return res.status(400).json({

                        message:
                            "Please enter a valid target attempt year."

                    });
                }


                // ========================================
                // SEARCH VERIFIED EXAM
                // ========================================

                const verifiedExam =
                    await ExamSchedule.findOne({

                        examName:
                            examName.trim(),

                        examGroup:
                            examGroup.trim(),

                        attemptYear:
                            attemptYear

                    });


                // ========================================
                // VERIFIED EXAM FOUND
                // ========================================

                if (verifiedExam) {

                    notificationDate =
                        verifiedExam.notificationDate ||
                        null;


                    sourceUrl =
                        verifiedExam.sourceUrl ||
                        "";


                    lastVerified =
                        verifiedExam.lastVerified ||
                        null;


                    minimumAge =
                        verifiedExam.minimumAge !== undefined
                            ? verifiedExam.minimumAge
                            : null;


                    maximumAge =
                        verifiedExam.maximumAge !== undefined
                            ? verifiedExam.maximumAge
                            : null;


                    requiredEducation =
                        verifiedExam.educationQualification ||
                        "";


                    // ----------------------------------------
                    // EXAM DATE
                    // ----------------------------------------

                    if (
                        verifiedExam.examDate
                    ) {

                        targetDate =
                            verifiedExam.examDate;


                        availableDays =
                            calculateAvailableDays(
                                targetDate
                            );
                    }


                    // ----------------------------------------
                    // AGE ELIGIBILITY
                    // ----------------------------------------

                    const userAge =
                        calculateAge(
                            user.dateOfBirth
                        );


                    let ageEligible = true;

                    let ageReason = "";


                    if (
                        userAge === null
                    ) {

                        ageEligible = false;

                        ageReason =
                            "Date of birth is not available.";
                    }


                    if (
                        minimumAge !== null &&
                        userAge !== null &&
                        userAge < minimumAge
                    ) {

                        ageEligible = false;

                        ageReason =
                            "You do not meet the minimum age requirement.";
                    }


                    if (
                        maximumAge !== null &&
                        userAge !== null &&
                        userAge > maximumAge
                    ) {

                        ageEligible = false;

                        ageReason =
                            "You exceed the maximum age limit.";
                    }


                    // ----------------------------------------
                    // EDUCATION ELIGIBILITY
                    // ----------------------------------------

                    const educationEligible =
                        checkEducationEligibility(
                            user.educationQualification,
                            requiredEducation
                        );


                    // ----------------------------------------
                    // FINAL ELIGIBILITY
                    // ----------------------------------------

                    if (
                        !educationEligible
                    ) {

                        eligibility =
                            "Not Eligible";


                        eligibilityReason =
                            "Your education qualification does not meet the verified requirement.";

                    }

                    else if (
                        !ageEligible
                    ) {

                        eligibility =
                            "Not Eligible";


                        eligibilityReason =
                            ageReason;

                    }

                    else {

                        eligibility =
                            "Eligible";


                        eligibilityReason =
                            "You meet the verified age and education requirements.";
                    }

                }


                // ========================================
                // NO VERIFIED EXAM DATA
                // ========================================

                else {

                    /*
                     * Future exam years such as 2028,
                     * 2029, etc. can still be saved.
                     */

                    eligibility =
                        "Not Verified";


                    eligibilityReason =
                        "Official examination schedule for the selected attempt year has not been announced or verified yet.";


                    notificationDate =
                        null;

                    targetDate =
                        null;

                    sourceUrl =
                        "";

                    lastVerified =
                        null;

                    minimumAge =
                        null;

                    maximumAge =
                        null;

                    requiredEducation =
                        "";

                    availableDays =
                        null;
                }
            }


            // ========================================
            // BOTH GOALS
            // ========================================

            /*
             * If both Academic and Competitive are selected
             * and the competitive exam does not have a
             * verified target date, use the academic exam date.
             */

            if (
                hasAcademicGoal &&
                hasCompetitiveGoal &&
                !targetDate &&
                academicExamDate
            ) {

                targetDate =
                    new Date(
                        academicExamDate
                    );


                availableDays =
                    calculateAvailableDays(
                        targetDate
                    );
            }


            // ========================================
            // PREPARE CLEAN SUBJECTS
            // ========================================

            const finalSubjects =
                hasAcademicGoal &&
                Array.isArray(subjects)

                    ? subjects
                        .map(
                            subject =>
                                String(subject).trim()
                        )
                        .filter(
                            subject =>
                                subject.length > 0
                        )

                    : [];


            // ========================================
            // CREATE / UPDATE GOAL
            // ========================================

            const goal =
                await Goal.findOneAndUpdate(

                    {
                        user:
                            req.user._id
                    },

                    {

                        user:
                            req.user._id,


                        // ====================================
                        // GOAL TYPE
                        // ====================================

                        goalType:
                            goalType,


                        // ====================================
                        // ACADEMIC DETAILS
                        // ====================================

                        educationQualification:
                            hasAcademicGoal
                                ? educationQualification.trim()
                                : "",


                        studentClass:
                            hasAcademicGoal
                                ? studentClass.trim()
                                : "",


                        schoolName:
                            hasAcademicGoal
                                ? schoolName.trim()
                                : "",


                        subjects:
                            finalSubjects,


                        academicExamDate:
                            hasAcademicGoal
                                ? academicExamDate
                                : null,


                        // ====================================
                        // COMPETITIVE DETAILS
                        // ====================================

                        examName:
                            hasCompetitiveGoal
                                ? examName.trim()
                                : "",


                        examGroup:
                            hasCompetitiveGoal
                                ? examGroup.trim()
                                : "",


                        preparationLevel:
                            hasCompetitiveGoal
                                ? preparationLevel
                                : "",


                        targetAttempt:
                            hasCompetitiveGoal
                                ? String(targetAttempt)
                                : "",


                        // ====================================
                        // VERIFIED DETAILS
                        // ====================================

                        notificationDate:
                            notificationDate,


                        targetDate:
                            targetDate,


                        sourceUrl:
                            sourceUrl,


                        lastVerified:
                            lastVerified,


                        minimumAge:
                            minimumAge,


                        maximumAge:
                            maximumAge,


                        requiredEducation:
                            requiredEducation,


                        eligibility:
                            eligibility,


                        eligibilityReason:
                            eligibilityReason,


                        availableDays:
                            availableDays,


                        // ====================================
                        // STUDY TIME
                        // ====================================

                        dailyStudyHours:
                            studyHours

                    },

                    {
                        new: true,
                        upsert: true,
                        runValidators: true
                    }
                );


            // ========================================
            // SUCCESS
            // ========================================

            return res.status(200).json({

                message:
                    "Goal saved successfully.",

                goal:
                    goal

            });

        }


        catch (error) {

            console.error(
                "Goal Save Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Server error while saving goal.",

                error:
                    error.message

            });
        }
    }
);


// ========================================
// GET SAVED GOAL
// ========================================

router.get(
    "/",
    protect,
    async (req, res) => {

        try {

            const goal =
                await Goal.findOne({

                    user:
                        req.user._id

                });


            if (!goal) {

                return res.status(404).json({

                    message:
                        "Goal not found."

                });
            }


            return res.status(200).json(
                goal
            );

        }


        catch (error) {

            console.error(
                "Goal Load Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Server error while loading goal.",

                error:
                    error.message

            });
        }
    }
);


module.exports = router;