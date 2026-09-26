const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// GET USER PROFILE
// ========================================

router.get("/", protect, async (req, res) => {

    try {

        const user = await User.findById(
            req.user._id
        ).select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json(user);

    } catch (error) {

        console.error(
            "Profile Load Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ========================================
// UPDATE USER PROFILE
// ========================================

router.put("/", protect, async (req, res) => {

    try {

        const {
            name,
            dateOfBirth,
            educationQualification
        } = req.body;


        const user = await User.findById(
            req.user._id
        );

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        // ========================================
        // UPDATE NAME
        // ========================================

        if (name !== undefined) {

            user.name =
                name.trim();

        }


        // ========================================
        // UPDATE DATE OF BIRTH
        // ========================================

        if (dateOfBirth !== undefined) {

            user.dateOfBirth =
                dateOfBirth;

        }


        // ========================================
        // UPDATE EDUCATION
        // ========================================

        if (
            educationQualification !== undefined
        ) {

            user.educationQualification =
                educationQualification.trim();

        }


        await user.save();


        res.status(200).json({

            message:
                "Profile updated successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                dateOfBirth:
                    user.dateOfBirth,
                educationQualification:
                    user.educationQualification,
                onboardingCompleted:
                    user.onboardingCompleted
            }

        });

    } catch (error) {

        console.error(
            "Profile Update Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


module.exports = router;