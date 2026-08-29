const express = require("express");

const { askAITutor } = require("../controllers/aiController");

const router = express.Router();

router.post("/ask", askAITutor);

module.exports = router;