const User = require("../models/user");
const Goal = require("../models/Goal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ========================================
// REGISTER USER
// ========================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            dateOfBirth,
            educationQualification
        } = req.body;


        // ========================================
        // CHECK REQUIRED FIELDS
        // ========================================

        if (
            !name ||
            !email ||
            !password ||
            !dateOfBirth ||
            !educationQualification
        ) {

            return res.status(400).json({

                message:
                    "All fields are required"

            });

        }


        // ========================================
        // CHECK EXISTING USER
        // ========================================

        const userExists =
            await User.findOne({

                email:
                    email.toLowerCase()

            });


        if (userExists) {

            return res.status(400).json({

                message:
                    "User already exists"

            });

        }


        // ========================================
        // HASH PASSWORD
        // ========================================

        const salt =
            await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
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
                    educationQualification.trim(),

                onboardingCompleted:
                    false

            });


        // ========================================
        // GENERATE JWT
        // ========================================

        const token =
            jwt.sign(

                {
                    id:
                        user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1d"
                }

            );


        // ========================================
        // REGISTER RESPONSE
        // ========================================

        return res.status(201).json({

            message:
                "User Registered Successfully",

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
            "Register Error:",
            error
        );


        return res.status(500).json({

            message:
                error.message

        });

    }

};



// ========================================
// LOGIN USER
// ========================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ========================================
        // CHECK REQUIRED FIELDS
        // ========================================

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        // ========================================
        // FIND USER
        // ========================================

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


        // ========================================
        // CHECK PASSWORD
        // ========================================

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


        // ========================================
        // CHECK WHETHER USER HAS GOAL
        // ========================================

        let hasGoal = false;

        try {

            const existingGoal =
                await Goal.findOne({

                    user:
                        user._id

                });


            if (existingGoal) {

                hasGoal = true;

            }

        } catch (goalError) {

            console.error(
                "Goal Check Error:",
                goalError
            );

        }


        // ========================================
        // DETERMINE ONBOARDING STATUS
        // ========================================

        const onboardingCompleted =
            Boolean(
                user.onboardingCompleted ||
                hasGoal
            );


        // ========================================
        // UPDATE DATABASE STATUS
        // ========================================

        if (
            onboardingCompleted &&
            !user.onboardingCompleted
        ) {

            user.onboardingCompleted =
                true;

            await user.save();

        }


        // ========================================
        // GENERATE JWT
        // ========================================

        const token =
            jwt.sign(

                {
                    id:
                        user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1d"
                }

            );


        // ========================================
        // LOGIN RESPONSE
        // ========================================

        return res.status(200).json({

            message:
                "Login Successful",

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
                    onboardingCompleted

            }

        });

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        return res.status(500).json({

            message:
                error.message

        });

    }

};



// ========================================
// EXPORT
// ========================================

module.exports = {

    registerUser,

    loginUser

};