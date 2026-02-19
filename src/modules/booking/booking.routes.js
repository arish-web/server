const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");

const {
  createBooking,
  updateBookingStatus,
  getBookings,
  getInstructorBookings,
  getPendingBookings,
  approveBooking,
  assignInstructor
} = require("./booking.controller");

/* ===============================
   STUDENT
================================ */

// Create booking request
router.post("/", auth, role(["STUDENT", "ADMIN"]), createBooking);

/* ===============================
   COMMON (ALL ROLES)
================================ */

// View bookings (paginated)
router.get("/", auth, role(["ADMIN", "INSTRUCTOR", "STUDENT"]), getBookings);

/* ===============================
   ADMIN
================================ */

// View pending requests
router.get("/pending", auth, role(["ADMIN"]), getPendingBookings);

// Approve booking
router.patch("/:id/approve", auth, role(["ADMIN"]), approveBooking);

// Assign instructor
router.patch("/:id/assign", auth, role(["ADMIN"]), assignInstructor);

/* ===============================
   INSTRUCTOR
================================ */

// Instructor's own bookings
router.get("/instructor", auth, role(["INSTRUCTOR"]), getInstructorBookings);

// Instructor updates status (COMPLETED / CANCELLED)
router.patch("/:id/status", auth, role(["INSTRUCTOR"]), updateBookingStatus);

module.exports = router;
