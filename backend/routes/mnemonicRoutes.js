const express = require("express");

const {
    generateMnemonic,
    generateStory
} = require("../controllers/mnemonicController");

const router = express.Router();

// Generate Mnemonic
router.post("/mnemonic", generateMnemonic);

// Generate Story
router.post("/story", generateStory);

module.exports = router;