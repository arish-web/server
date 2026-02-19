const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");

const {
  createModule,
  getModulesByCourse
} = require("./module.controller");

router.post("/", auth, role(["ADMIN", "INSTRUCTOR"]), createModule);

router.get("/:courseId", auth, role(["ADMIN", "INSTRUCTOR", "STUDENT"]), getModulesByCourse);

module.exports = router;
