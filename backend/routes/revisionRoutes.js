const express = require("express");
const Revision = require("../models/Revision");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// CREATE AUTOMATIC REVISION
// ========================================

router.post("/", protect, async (req, res) => {
  try {

    const {
      subject,
      topic,
      score,
      totalQuestions
    } = req.body;


    // ========================================
    // VALIDATION
    // ========================================

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


    // ========================================
    // CALCULATE PERCENTAGE
    // ========================================

    const percentage =
      Math.round(
        (Number(score) / Number(totalQuestions)) * 100
      );


    // ========================================
    // AUTOMATIC REVISION INTERVAL
    // ========================================

    let intervalDays;


    if (percentage <= 40) {

      intervalDays = 1;

    } else if (percentage <= 60) {

      intervalDays = 3;

    } else if (percentage <= 80) {

      intervalDays = 7;

    } else {

      intervalDays = 14;

    }


    // ========================================
    // CALCULATE REVISION DATE
    // ========================================

    const revisionDateObject = new Date();

    revisionDateObject.setDate(
      revisionDateObject.getDate() + intervalDays
    );


    const year =
      revisionDateObject.getFullYear();

    const month =
      String(
        revisionDateObject.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        revisionDateObject.getDate()
      ).padStart(2, "0");


    const revisionDate =
      `${year}-${month}-${day}`;


    // ========================================
    // CREATE REVISION
    // ========================================

    const revision =
      await Revision.create({

        user: req.user._id,

        subject,

        topic,

        score: Number(score),

        totalQuestions:
          Number(totalQuestions),

        percentage,

        intervalDays,

        revisionDate

      });


    // ========================================
    // RESPONSE
    // ========================================

    res.status(201).json({

      success: true,

      message:
        "Automatic revision scheduled successfully",

      revision

    });


  } catch (error) {

    console.error(
      "Automatic revision error:",
      error
    );


    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }
});


// ========================================
// GET USER REVISIONS
// ========================================

router.get("/", protect, async (req, res) => {
  try {

    const revisions =
      await Revision.find({
        user: req.user._id
      }).sort({
        revisionDate: 1
      });


    res.status(200).json({

      success: true,

      revisions

    });


  } catch (error) {

    console.error(
      "Fetch revisions error:",
      error
    );


    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }
});


// ========================================
// MARK REVISION AS COMPLETED
// ========================================

router.put("/:id/complete", protect, async (req, res) => {
  try {

    const revision =
      await Revision.findOneAndUpdate(

        {
          _id: req.params.id,

          user: req.user._id
        },

        {
          completed: true
        },

        {
          new: true
        }

      );


    if (!revision) {

      return res.status(404).json({

        success: false,

        message: "Revision not found"

      });

    }


    res.status(200).json({

      success: true,

      message:
        "Revision marked as completed",

      revision

    });


  } catch (error) {

    console.error(
      "Complete revision error:",
      error
    );


    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }
});


module.exports = router;