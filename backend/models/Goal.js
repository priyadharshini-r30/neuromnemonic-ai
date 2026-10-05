const mongoose = require("mongoose");


// ========================================
// GOAL SCHEMA
// ========================================

const goalSchema = new mongoose.Schema(

    {

        // ========================================
        // USER
        // ========================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ========================================
        // GOAL TYPE
        // ========================================

        goalType: {
            type: [String],
            enum: [
                "Academic",
                "Competitive Exam"
            ],
            required: true
        },


        // ========================================
        // ACADEMIC DETAILS
        // ========================================

        educationQualification: {
            type: String,
            default: ""
        },


        studentClass: {
            type: String,
            default: ""
        },


        schoolName: {
            type: String,
            default: ""
        },


        subjects: {
            type: [String],
            default: []
        },


        academicExamDate: {
            type: Date,
            default: null
        },


        // ========================================
        // COMPETITIVE EXAM DETAILS
        // ========================================

        examName: {
            type: String,
            default: ""
        },


        examGroup: {
            type: String,
            default: ""
        },


        preparationLevel: {
            type: String,

            enum: [
                "Beginner",
                "Intermediate",
                "Advanced",
                ""
            ],

            default: ""
        },


        targetAttempt: {
            type: String,
            default: ""
        },


        // ========================================
        // VERIFIED EXAM DETAILS
        // ========================================

        notificationDate: {
            type: Date,
            default: null
        },


        targetDate: {
            type: Date,
            default: null
        },


        sourceUrl: {
            type: String,
            default: ""
        },


        lastVerified: {
            type: Date,
            default: null
        },


        // ========================================
        // ELIGIBILITY DETAILS
        // ========================================

        minimumAge: {
            type: Number,
            default: null
        },


        maximumAge: {
            type: Number,
            default: null
        },


        requiredEducation: {
            type: String,
            default: ""
        },


        eligibility: {
            type: String,

            enum: [
                "Eligible",
                "Not Eligible",
                "Not Verified",
                ""
            ],

            default: ""
        },


        eligibilityReason: {
            type: String,
            default: ""
        },


        // ========================================
        // AVAILABLE PREPARATION DAYS
        // ========================================

        availableDays: {
            type: Number,
            default: null
        },


        // ========================================
        // COMMON STUDY DETAILS
        // ========================================

        dailyStudyHours: {
            type: Number,
            required: true
        }

    },

    {
        timestamps: true
    }

);


// ========================================
// EXPORT MODEL
// ========================================

module.exports = mongoose.model(
    "Goal",
    goalSchema
);