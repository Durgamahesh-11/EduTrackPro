require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000"], // later add Vercel URL
  credentials: true
}));

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const hodRoutes = require("./routes/hodRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Root check
app.get("/", (req, res) => {
  res.send("EduTrackPro Backend Running 🚀");
});

// ✅ Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});