const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");


const {
  createLesson,
  getLessonsByModule,
  getLessons
} = require("./lesson.controller");

router.post("/", auth, role(["ADMIN", "INSTRUCTOR"]), createLesson);

router.get("/:moduleId", auth, role(["ADMIN", "INSTRUCTOR", "STUDENT"]), getLessonsByModule);

router.get("/", auth, role(["ADMIN", "INSTRUCTOR", "STUDENT"]), getLessons);


module.exports = router;
