const express = require("express");
const StudyPlan = require("../models/StudyPlan");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create a study plan
router.post("/", protect, async (req, res) => {
  try {
    const { subject, topic, date, duration } = req.body;

    if (!subject || !topic || !date || !duration) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const studyPlan = await StudyPlan.create({
      user: req.user._id,
      subject,
      topic,
      date,
      duration,
    });

    res.status(201).json({
      success: true,
      message: "Study plan created successfully",
      studyPlan,
    });
  } catch (error) {
    console.error("Study plan error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get all study plans
router.get("/", protect, async (req, res) => {
  try {
    const studyPlans = await StudyPlan.find({
      user: req.user._id,
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      studyPlans,
    });
  } catch (error) {
    console.error("Fetch study plans error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Mark study plan as completed
router.put("/:id/complete", protect, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        completed: true,
      },
      {
        new: true,
      }
    );

    if (!studyPlan) {
      return res.status(404).json({
        success: false,
        message: "Study plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Study plan marked as completed",
      studyPlan,
    });
  } catch (error) {
    console.error("Complete study plan error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;