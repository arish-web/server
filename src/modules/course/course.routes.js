const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");

const {
  createCourse,
  getCourses
} = require("./course.controller");

// Admin + Instructor create
router.post("/", auth, role(["ADMIN", "INSTRUCTOR"]), createCourse);
// Everyone can view (within tenant)
router.get("/", auth, role(["ADMIN", "INSTRUCTOR", "STUDENT"]), getCourses);

module.exports = router;
