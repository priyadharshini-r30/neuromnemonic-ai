const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route working!",
    user: req.user
  });
});

module.exports = router;