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
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const profileRoutes = require("./routes/profileRoutes");
const goalRoutes = require("./routes/goalRoutes");
const examRoutes = require("./routes/examRoutes");
const revisionRoutes = require("./routes/revisionRoutes");
const progressRoutes = require("./routes/progressRoutes");

dotenv.config();

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());


// ========================================
// DATABASE
// ========================================

connectDB();


// ========================================
// API ROUTES
// ========================================

app.use("/api/users", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/mnemonic", mnemonicRoutes);

app.use("/api/study-plans", studyPlanRoutes);

app.use("/api/quiz", quizRoutes);

app.use("/api/quiz-attempts", quizAttemptRoutes);

app.use("/api/roadmaps", roadmapRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/goals", goalRoutes);

app.use("/api/exams", examRoutes);

app.use("/api/revisions", revisionRoutes);

app.use("/api/progress", progressRoutes);


// ========================================
// FRONTEND
// ========================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// ========================================
// HOME PAGE
// ========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../frontend/ai-tutor.html"
        )
    );

});


// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});