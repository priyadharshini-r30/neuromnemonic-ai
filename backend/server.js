const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const profileRoutes = require("./routes/profileRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const aiRoutes = require("./routes/aiRoutes");

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/ai", aiRoutes);

// Basic test route
app.get("/", (req, res) => {
    res.json({
        message: "NeuroMnemonic AI Backend is running 🚀"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});