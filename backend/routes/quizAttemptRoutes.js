const express = require("express");

const QuizAttempt = require("../models/QuizAttempt");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const {
      subject,
      topic,
      score,
      totalQuestions
    } = req.body;

    if (
      !subject ||
      !topic ||
      score === undefined ||
      !totalQuestions
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Subject, topic, score and total questions are required"
      });
    }

    const percentage =
      Math.round(
        (Number(score) / Number(totalQuestions)) * 100
      );

    const quizAttempt =
      await QuizAttempt.create({
        user: req.user._id,
        subject,
        topic,
        score: Number(score),
        totalQuestions: Number(totalQuestions),
        percentage
      });

    res.status(201).json({
      success: true,
      message: "Quiz attempt saved successfully",
      quizAttempt
    });

  } catch (error) {
    console.error(
      "Save quiz attempt error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const attempts =
      await QuizAttempt.find({
        user: req.user._id
      }).sort({
        createdAt: -1
      });

    res.status(200).json({
      success: true,
      attempts
    });

  } catch (error) {
    console.error(
      "Fetch quiz attempts error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;