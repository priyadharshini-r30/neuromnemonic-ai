const mongoose = require("mongoose");


// ========================================
// USER SCHEMA
// ========================================

const userSchema = new mongoose.Schema(
    {

        // ========================================
        // PERSONAL INFORMATION
        // ========================================

        name: {
            type: String,
            required: true,
            trim: true
        },


        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },


        password: {
            type: String,
            required: true
        },


        dateOfBirth: {
            type: Date,
            required: true
        },


        // ========================================
        // EDUCATION
        // ========================================

        educationQualification: {
            type: String,
            default: "",
            trim: true
        },


        // ========================================
        // ONBOARDING
        // ========================================

        onboardingCompleted: {
            type: Boolean,
            default: false
        }

    },


    {
        timestamps: true
    }

);


// ========================================
// EXPORT MODEL
// ========================================

module.exports =
    mongoose.models.User ||
    mongoose.model(
        "User",
        userSchema
    );