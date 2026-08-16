const express = require("express");
const Profile = require("../models/Profile");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create or update profile
router.post("/", protect, async (req, res) => {
    try {
        const {
            age,
            college,
            course,
            studyGoal,
            targetExam,
            dailyStudyHours,
            subjects,
            bio
        } = req.body;

        // Validation
        if (
            !age ||
            !college ||
            !course ||
            !studyGoal ||
            !targetExam ||
            !dailyStudyHours ||
            !subjects ||
            !Array.isArray(subjects) ||
            subjects.length === 0
        ) {
            return res.status(400).json({
                message: "Please fill all required profile details"
            });
        }

        const profile = await Profile.findOneAndUpdate(
            { user: req.user._id },
            {
                user: req.user._id,
                age,
                college,
                course,
                studyGoal,
                targetExam,
                dailyStudyHours,
                subjects,
                bio: bio || ""
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            message: "Profile saved successfully",
            profile
        });

    } catch (error) {
        console.error("Profile Save Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// Get profile
router.get("/", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user._id
        }).populate("user", "name email role");

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        // Send User + Profile data together
        res.status(200).json({
            name: profile.user.name,
            email: profile.user.email,
            role: profile.user.role,

            age: profile.age,
            college: profile.college,
            course: profile.course,
            studyGoal: profile.studyGoal,
            targetExam: profile.targetExam,
            dailyStudyHours: profile.dailyStudyHours,
            subjects: profile.subjects,
            bio: profile.bio
        });

    } catch (error) {
        console.error("Profile Load Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


module.exports = router;