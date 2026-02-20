require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

/* -------------------- LOAD BACKGROUND JOBS -------------------- */
require("./jobs/escalation.job");

/* -------------------- IMPORT ROUTES -------------------- */
const authRoutes = require("./modules/auth/auth.routes");
const courseRoutes = require("./modules/course/course.routes");
const moduleRoutes = require("./modules/module/module.routes");
const lessonRoutes = require("./modules/lesson/lesson.routes");
const quizRoutes = require("./modules/quiz/quiz.routes");
const availabilityRoutes = require("./modules/availability/availability.routes");
const bookingRoutes = require("./modules/booking/booking.routes");
const getAuditLogs = require("./modules/audit/audit.routes");



/* -------------------- IMPORT MIDDLEWARE -------------------- */
const auth = require("./middleware/auth.middleware");
const role = require("./middleware/role.middleware");

const app = express();

/* -------------------- GLOBAL MIDDLEWARE -------------------- */
app.use(
  cors({
    origin: [
      "https://client-airman.vercel.app",
      "http://localhost:5000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

/* -------------------- RATE LIMITERS -------------------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many auth requests, try again later"
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many booking requests, try again later"
});

/* -------------------- ROUTES -------------------- */
app.use("/auth", authLimiter, authRoutes);
app.use("/courses", courseRoutes);
app.use("/modules", moduleRoutes);
app.use("/lessons", lessonRoutes);
app.use("/quiz", quizRoutes);
app.use("/availability", availabilityRoutes);
app.use("/booking", bookingLimiter, bookingRoutes);
app.use("/audit", getAuditLogs);

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("API running");
});

/* -------------------- TEST RBAC ROUTE -------------------- */
app.get("/admin-only", auth, role(["ADMIN"]), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
