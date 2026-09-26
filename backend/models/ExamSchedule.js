const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema(
    {
        // ========================================
        // EXAM DETAILS
        // ========================================

        examName: {
            type: String,
            required: true,
            trim: true
        },

        examGroup: {
            type: String,
            required: true,
            trim: true
        },

        attemptYear: {
            type: Number,
            required: true
        },


        // ========================================
        // OFFICIAL SCHEDULE
        // ========================================

        notificationDate: {
            type: Date,
            default: null
        },

        examDate: {
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

        educationQualification: {
            type: String,
            default: ""
        },

        eligibilityNotes: {
            type: String,
            default: ""
        },


        // ========================================
        // OFFICIAL SOURCE
        // ========================================

        sourceUrl: {
            type: String,
            required: true,
            trim: true
        },

        lastVerified: {
            type: Date,
            required: true
        }
    },

    {
        timestamps: true
    }
);


// ========================================
// PREVENT DUPLICATE EXAM RECORD
// ========================================

examScheduleSchema.index(
    {
        examName: 1,
        examGroup: 1,
        attemptYear: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model(
    "ExamSchedule",
    examScheduleSchema
);