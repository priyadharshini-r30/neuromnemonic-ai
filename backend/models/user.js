const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "aspirant"],
      required: true,
    },

    age: {
      type: Number,
    },

    college: {
      type: String,
    },

    course: {
      type: String,
    },

    studyGoal: {
      type: String,
    },

    targetExam: {
      type: String,
    },

    dailyStudyHours: {
      type: Number,
    },

    subjects: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);