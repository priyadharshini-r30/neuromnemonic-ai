const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        age: {
            type: Number,
            required: true
        },

        college: {
            type: String,
            required: true
        },

        course: {
            type: String,
            required: true
        },

        studyGoal: {
            type: String,
            required: true
        },

        targetExam: {
            type: String,
            required: true
        },

        dailyStudyHours: {
            type: Number,
            required: true
        },

        subjects: {
            type: [String],
            default: []
        },

        bio: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Profile", profileSchema);