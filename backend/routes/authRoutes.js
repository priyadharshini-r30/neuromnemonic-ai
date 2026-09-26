const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


// ========================================
// REGISTER
// ========================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            dateOfBirth,
            educationQualification
        } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !name ||
            !email ||
            !password ||
            !dateOfBirth
        ) {

            return res.status(400).json({
                message:
                    "Name, email, password and date of birth are required"
            });

        }


        // ========================================
        // CHECK EXISTING USER
        // ========================================

        const existingUser =
            await User.findOne({
                email: email.toLowerCase().trim()
            });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "User already exists"
            });

        }


        // ========================================
        // HASH PASSWORD
        // ========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ========================================
        // CREATE USER
        // ========================================

        const user =
            await User.create({

                name:
                    name.trim(),

                email:
                    email.toLowerCase().trim(),

                password:
                    hashedPassword,

                dateOfBirth:
                    dateOfBirth,

                educationQualification:
                    educationQualification || "",

                onboardingCompleted:
                    false

            });


        // ========================================
        // CREATE TOKEN
        // ========================================

        const token =
            jwt.sign(
                {
                    id: user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );


        // ========================================
        // RESPONSE
        // ========================================

        res.status(201).json({

            message:
                "Registration successful",

            token,

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
            "Registration Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

});


// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        const user =
            await User.findOne({
                email:
                    email.toLowerCase().trim()
            });


        if (!user) {

            return res.status(400).json({
                message:
                    "Invalid email or password"
            });

        }


        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(400).json({
                message:
                    "Invalid email or password"
            });

        }


        const token =
            jwt.sign(
                {
                    id: user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );


        res.status(200).json({

            message:
                "Login successful",

            token,

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
            "Login Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

});


module.exports = router;