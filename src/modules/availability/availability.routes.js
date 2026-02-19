const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");

const {
  createAvailability,
  getInstructorAvailability,
  deleteAvailability
} = require("./availability.controller");

router.post("/", auth, role(["INSTRUCTOR", "ADMIN"]), createAvailability);

router.get("/", auth, role(["INSTRUCTOR", "ADMIN"]), getInstructorAvailability);

router.delete("/:id", auth, role(["INSTRUCTOR", "ADMIN"]), deleteAvailability);

module.exports = router;
