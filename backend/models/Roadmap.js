const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        topic: {
            type: String,
            required: true,
            trim: true
        },

        preferredLanguage: {
            type: String,
            required: true,
            trim: true
        },

        learningLevel: {
            type: String,
            required: true,
            trim: true
        },

        duration: {
            type: Number,
            required: true
        },

        roadmap: [
            {
                day: {
                    type: Number,
                    required: true
                },

                topic: {
                    type: String,
                    required: true
                },

                description: {
                    type: String,
                    default: ""
                },

                completed: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);