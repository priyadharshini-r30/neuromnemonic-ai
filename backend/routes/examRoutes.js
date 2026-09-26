const express = require("express");
const ExamSchedule = require("../models/ExamSchedule");

const router = express.Router();


// ========================================
// GET ALL VERIFIED EXAM SCHEDULES
// ========================================

router.get("/", async (req, res) => {

    try {

        const exams =
            await ExamSchedule.find()
                .sort({
                    examName: 1,
                    attemptYear: 1
                });

        return res.status(200).json(exams);

    } catch (error) {

        console.error(
            "Exam Schedule Load Error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ========================================
// SEARCH EXAM
// ========================================
// Verified data irundha details return pannum.
// Data illa na 404 return pannum.
// 2028 maari future year-ku idhu normal.
// Goal save-ai indha 404 block panna koodadhu.
// ========================================

router.get(
    "/search",
    async (req, res) => {

        try {

            const {
                examName,
                examGroup,
                attemptYear
            } = req.query;


            // ========================================
            // VALIDATION
            // ========================================

            if (
                !examName ||
                !examGroup ||
                !attemptYear
            ) {

                return res.status(400).json({
                    message:
                        "Exam name, group and attempt year are required"
                });

            }


            const year =
                Number(attemptYear);


            if (isNaN(year)) {

                return res.status(400).json({
                    message:
                        "Invalid attempt year"
                });

            }


            // ========================================
            // FIND VERIFIED EXAM
            // ========================================

            const exam =
                await ExamSchedule.findOne({

                    examName:
                        examName.trim(),

                    examGroup:
                        examGroup.trim(),

                    attemptYear:
                        year

                });


            // ========================================
            // NO VERIFIED DATA
            // ========================================
            // Important:
            // 2028 schedule illa na error-nu treat
            // pannalam, but goal save block panna koodadhu.
            // ========================================

            if (!exam) {

                return res.status(404).json({

                    verified: false,

                    message:
                        "Official examination schedule has not been announced or verified for this attempt year."

                });

            }


            // ========================================
            // CALCULATE AVAILABLE DAYS
            // ========================================

            let availableDays = null;


            if (exam.examDate) {

                const today =
                    new Date();

                const examDate =
                    new Date(
                        exam.examDate
                    );


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


                availableDays =
                    Math.ceil(
                        difference /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    );


                if (availableDays < 0) {
                    availableDays = 0;
                }

            }


            // ========================================
            // SEND VERIFIED DATA
            // ========================================

            return res.status(200).json({

                verified: true,

                examName:
                    exam.examName,

                examGroup:
                    exam.examGroup,

                attemptYear:
                    exam.attemptYear,


                // ====================================
                // SCHEDULE
                // ====================================

                notificationDate:
                    exam.notificationDate,

                examDate:
                    exam.examDate,

                availableDays:
                    availableDays,


                // ====================================
                // ELIGIBILITY
                // ====================================

                minimumAge:
                    exam.minimumAge,

                maximumAge:
                    exam.maximumAge,

                educationQualification:
                    exam.educationQualification,

                eligibilityNotes:
                    exam.eligibilityNotes,


                // ====================================
                // SYLLABUS
                // ====================================
                // If syllabus field exists in DB,
                // send it.
                // Otherwise return empty array.
                // ====================================

                syllabus:
                    Array.isArray(exam.syllabus)
                        ? exam.syllabus
                        : [],


                // ====================================
                // OFFICIAL SOURCE
                // ====================================

                sourceUrl:
                    exam.sourceUrl,

                lastVerified:
                    exam.lastVerified

            });


        } catch (error) {

            console.error(
                "Exam Schedule Search Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Server error",

                error:
                    error.message

            });

        }
    }
);


module.exports = router;