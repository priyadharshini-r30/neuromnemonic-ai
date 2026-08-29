const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const aiRoutes = require("./routes/aiRoutes");
const mnemonicRoutes = require("./routes/mnemonicRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const quizRoutes = require("./routes/quizRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");

dotenv.config();

const app = express();

// -----------------------------------
// Middleware
// -----------------------------------
app.use(cors());
app.use(express.json());

// -----------------------------------
// Database Connection
// -----------------------------------
connectDB();

// -----------------------------------
// API Routes
// -----------------------------------
app.use("/api/users", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mnemonic", mnemonicRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/roadmaps", roadmapRoutes);

// -----------------------------------
// Serve Frontend
// -----------------------------------
app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// -----------------------------------
// Home Route
// -----------------------------------
app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/ai-tutor.html"
        )
    );
});

// -----------------------------------
// Start Server
// -----------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});