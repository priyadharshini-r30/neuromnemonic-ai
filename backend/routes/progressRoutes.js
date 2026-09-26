const express = require("express");

const QuizAttempt = require("../models/QuizAttempt");
const StudyPlan = require("../models/StudyPlan");
const Revision = require("../models/Revision");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
    try {
        const quizAttempts =
            await QuizAttempt.find({
                user: req.user._id
            }).sort({
                createdAt: -1
            });

        const studyPlans =
            await StudyPlan.find({
                user: req.user._id
            });

        const revisions =
            await Revision.find({
                user: req.user._id
            });

        const totalQuizzes =
            quizAttempts.length;

        let averageScore = 0;

        if (totalQuizzes > 0) {
            const totalPercentage =
                quizAttempts.reduce(
                    (sum, attempt) =>
                        sum + attempt.percentage,
                    0
                );

            averageScore =
                Math.round(
                    totalPercentage /
                    totalQuizzes
                );
        }

        const totalStudyPlans =
            studyPlans.length;

        const completedStudyPlans =
            studyPlans.filter(
                plan =>
                    plan.completed === true
            ).length;

        let studyCompletion = 0;

        if (totalStudyPlans > 0) {
            studyCompletion =
                Math.round(
                    (
                        completedStudyPlans /
                        totalStudyPlans
                    ) * 100
                );
        }

        const totalRevisions =
            revisions.length;

        const completedRevisions =
            revisions.filter(
                revision =>
                    revision.completed === true
            ).length;

        let revisionCompletion = 0;

        if (totalRevisions > 0) {
            revisionCompletion =
                Math.round(
                    (
                        completedRevisions /
                        totalRevisions
                    ) * 100
                );
        }

        let overallProgress = 0;
        let progressParts = 0;

        if (totalQuizzes > 0) {
            overallProgress += averageScore;
            progressParts++;
        }

        if (totalStudyPlans > 0) {
            overallProgress += studyCompletion;
            progressParts++;
        }

        if (totalRevisions > 0) {
            overallProgress += revisionCompletion;
            progressParts++;
        }

        if (progressParts > 0) {
            overallProgress =
                Math.round(
                    overallProgress /
                    progressParts
                );
        }

        const topicMap = {};

        quizAttempts.forEach(
            attempt => {
                const topic =
                    attempt.topic;

                if (!topicMap[topic]) {
                    topicMap[topic] = {
                        topic,
                        totalScore: 0,
                        attempts: 0
                    };
                }

                topicMap[topic].totalScore +=
                    attempt.percentage;

                topicMap[topic].attempts++;
            }
        );

        const topicPerformance =
            Object.values(topicMap)
                .map(item => {
                    const percentage =
                        Math.round(
                            item.totalScore /
                            item.attempts
                        );

                    let status =
                        "Needs Practice";

                    if (percentage >= 80) {
                        status = "Strong";
                    } else if (
                        percentage < 60
                    ) {
                        status = "Weak";
                    }

                    return {
                        topic: item.topic,
                        percentage,
                        attempts: item.attempts,
                        status
                    };
                })
                .sort(
                    (a, b) =>
                        a.percentage -
                        b.percentage
                );

        res.status(200).json({
            success: true,
            progress: {
                overallProgress,
                averageScore,
                totalQuizzes,
                totalStudyPlans,
                completedStudyPlans,
                studyCompletion,
                totalRevisions,
                completedRevisions,
                revisionCompletion,
                topicPerformance,
                recentQuizAttempts:
                    quizAttempts.slice(
                        0,
                        5
                    )
            }
        });

    } catch (error) {
        console.error(
            "Progress error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load progress"
        });
    }
});

module.exports = router;