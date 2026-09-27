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

    const dob =
        new Date(dateOfBirth);

    const today =
        new Date();

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


// ========================================
// CALCULATE AVAILABLE DAYS
// ========================================

function calculateAvailableDays(
    targetDate
) {

    if (!targetDate) {
        return null;
    }

    const today =
        new Date();

    const examDate =
        new Date(targetDate);


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

            const {
                goalType,
                academicYear,
                course,
                semester,
                subjects,
                collegeExamDate,
                examName,
                examGroup,
                preparationLevel,
                targetAttempt,
                dailyStudyHours
            } = req.body;


            // ========================================
            // BASIC VALIDATION
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


            if (
                !dailyStudyHours
            ) {

                return res.status(400).json({

                    message:
                        "Daily study hours are required."

                });

            }


            const studyHours =
                Number(
                    dailyStudyHours
                );


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
            // CHECK SELECTED GOALS
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
            // DEFAULT VALUES
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

            if (
                hasAcademicGoal
            ) {

                if (
                    !academicYear ||
                    !course ||
                    !semester
                ) {

                    return res.status(400).json({

                        message:
                            "Please complete all Academic / College details."

                    });

                }


                if (
                    !Array.isArray(subjects) ||
                    subjects.length === 0
                ) {

                    return res.status(400).json({

                        message:
                            "Please enter at least one academic subject."

                    });

                }


                if (
                    !collegeExamDate
                ) {

                    return res.status(400).json({

                        message:
                            "College examination date is required."

                    });

                }


                const academicDate =
                    new Date(
                        collegeExamDate
                    );


                if (
                    isNaN(
                        academicDate.getTime()
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid college examination date."

                    });

                }


                // Academic exam date becomes target
                // only when there is no verified
                // competitive exam date.

                targetDate =
                    academicDate;


                availableDays =
                    calculateAvailableDays(
                        targetDate
                    );

            }


            // ========================================
            // COMPETITIVE EXAM GOAL
            // ========================================

            if (
                hasCompetitiveGoal
            ) {

                if (
                    !examName ||
                    !examGroup ||
                    !targetAttempt
                ) {

                    return res.status(400).json({

                        message:
                            "Exam, group/level and target attempt are required."

                    });

                }


                const attemptYear =
                    Number(
                        targetAttempt
                    );


                if (
                    isNaN(attemptYear)
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid target attempt year."

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

                if (
                    verifiedExam
                ) {

                    notificationDate =
                        verifiedExam.notificationDate;

                    sourceUrl =
                        verifiedExam.sourceUrl;

                    lastVerified =
                        verifiedExam.lastVerified;

                    minimumAge =
                        verifiedExam.minimumAge;

                    maximumAge =
                        verifiedExam.maximumAge;

                    requiredEducation =
                        verifiedExam.educationQualification ||
                        "";


                    // ====================================
                    // EXAM DATE
                    // ====================================

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


                    // ====================================
                    // ELIGIBILITY
                    // ====================================

                    const userAge =
                        calculateAge(
                            user.dateOfBirth
                        );


                    let ageEligible =
                        true;


                    let ageReason =
                        "";


                    if (
                        userAge === null
                    ) {

                        ageEligible =
                            false;

                        ageReason =
                            "Date of birth is not available.";

                    }


                    if (
                        minimumAge !== null &&
                        userAge !== null &&
                        userAge < minimumAge
                    ) {

                        ageEligible =
                            false;

                        ageReason =
                            "You do not meet the minimum age requirement.";

                    }


                    if (
                        maximumAge !== null &&
                        userAge !== null &&
                        userAge > maximumAge
                    ) {

                        ageEligible =
                            false;

                        ageReason =
                            "You exceed the maximum age limit.";

                    }


                    const educationEligible =
                        checkEducationEligibility(
                            user.educationQualification,
                            requiredEducation
                        );


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
                // Example:
                // TNPSC Group 1 - 2028
                //
                // Goal MUST still be saved.
                // Roadmap MUST still be available.
                // ========================================

                else {

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
            // ACADEMIC + COMPETITIVE
            // ========================================
            // If both are selected and competitive
            // has no verified exam date, use the
            // academic exam date as target date.
            // ========================================

            if (
                hasAcademicGoal &&
                hasCompetitiveGoal &&
                !targetDate
            ) {

                targetDate =
                    new Date(
                        collegeExamDate
                    );


                availableDays =
                    calculateAvailableDays(
                        targetDate
                    );

            }


            // ========================================
            // SAVE GOAL
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


                        goalType:
                            goalType,


                        // ====================================
                        // ACADEMIC
                        // ====================================

                        academicYear:
                            hasAcademicGoal
                                ? academicYear
                                : "",


                        course:
                            hasAcademicGoal
                                ? course
                                : "",


                        semester:
                            hasAcademicGoal
                                ? semester
                                : "",


                        subjects:
                            hasAcademicGoal &&
                            Array.isArray(subjects)
                                ? subjects
                                : [],


                        collegeExamDate:
                            hasAcademicGoal
                                ? collegeExamDate
                                : null,


                        // ====================================
                        // COMPETITIVE
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
                                ? preparationLevel || ""
                                : "",


                        targetAttempt:
                            hasCompetitiveGoal
                                ? String(
                                    targetAttempt
                                )
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


                        educationQualification:
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
            // SUCCESS RESPONSE
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
                    "Server error.",

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
                    "Server error.",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;