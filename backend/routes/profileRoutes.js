const express = require("express");
const User = require("../models/user");
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
                success: false,
                message: "User not found"
            });

        }


        return res.status(200).json({

            success: true,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                educationQualification:
                    user.educationQualification,
                onboardingCompleted:
                    user.onboardingCompleted
            }

        });

    } catch (error) {

        console.error(
            "Profile Load Error:",
            error
        );

        return res.status(500).json({

            success: false,

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


        // ========================================
        // FIND USER
        // ========================================

        const user = await User.findById(
            req.user._id
        );


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // ========================================
        // UPDATE NAME
        // ========================================

        if (
            name !== undefined &&
            name !== null
        ) {

            const trimmedName =
                String(name).trim();


            if (trimmedName.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name cannot be empty"

                });

            }


            user.name =
                trimmedName;

        }


        // ========================================
        // UPDATE DATE OF BIRTH
        // ========================================

        if (
            dateOfBirth !== undefined &&
            dateOfBirth !== null
        ) {

            user.dateOfBirth =
                dateOfBirth;

        }


        // ========================================
        // UPDATE EDUCATION QUALIFICATION
        // ========================================

        if (
            educationQualification !== undefined &&
            educationQualification !== null
        ) {

            user.educationQualification =
                String(
                    educationQualification
                ).trim();

        }


        // ========================================
        // SAVE USER
        // ========================================

        await user.save();


        // ========================================
        // RESPONSE
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "Profile updated successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

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


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

});



// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;