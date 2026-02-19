const prisma = require("../../config/db");
const { logAudit } = require("../../utils/auditLogger");

/* ===============================
   CREATE BOOKING (STUDENT)
================================ */
exports.createBooking = async (req, res) => {
  try {
    const { instructorId, startTime, endTime } = req.body;

    // Check instructor availability
    const slot = await prisma.availability.findFirst({
      where: {
        instructorId,
        tenantId: req.user.tenantId,
        startTime: { lte: new Date(startTime) },
        endTime: { gte: new Date(endTime) },
      },
    });

    if (!slot) {
      return res.status(400).json({
        message: "Instructor not available in this time slot",
      });
    }

    // Conflict detection
    const conflict = await prisma.booking.findFirst({
      where: {
        instructorId,
        tenantId: req.user.tenantId,
        OR: [
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) },
          },
        ],
      },
    });

    if (conflict) {
      return res.status(400).json({
        message: "Instructor already booked for this time",
      });
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: req.user.userId,
        instructorId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "REQUESTED",
        tenantId: req.user.tenantId,
      },
    });

    // Audit log
    await logAudit({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: "BOOKING_CREATED",
      entityType: "BOOKING",
      entityId: booking.id,
      afterState: booking,
    });

    res.json(booking);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating booking" });
  }
};

/* ===============================
   GET ALL BOOKINGS (PAGINATED)
================================ */
exports.getBookings = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const bookings = await prisma.booking.findMany({
      where: {
        tenantId: req.user.tenantId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.booking.count({
      where: {
        tenantId: req.user.tenantId,
      },
    });

    res.json({
      page,
      limit,
      total,
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

/* ===============================
   GET PENDING BOOKINGS (ADMIN)
================================ */
exports.getPendingBookings = async (req, res) => {
  try {
    console.log("USER TENANT:", req.user.tenantId);

    const all = await prisma.booking.findMany({
      select: {
        id: true,
        status: true,
        tenantId: true,
      },
    });

    console.log("ALL BOOKINGS:", all);

    const filtered = await prisma.booking.findMany({
      where: {
        tenantId: req.user.tenantId,
        status: "REQUESTED",
      },
    });

    console.log("FILTERED:", filtered);

    res.json(filtered);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching pending bookings" });
  }
};



/* ===============================
   ADMIN APPROVE BOOKING
================================ */
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const before = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: req.user.tenantId,
      },
    });

    if (!before) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    await logAudit({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: "BOOKING_APPROVED",
      entityType: "BOOKING",
      entityId: booking.id,
      beforeState: before,
      afterState: booking,
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error approving booking" });
  }
};

/* ===============================
   ADMIN ASSIGN INSTRUCTOR
================================ */
exports.assignInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructorId } = req.body;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: req.user.tenantId,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Conflict check before assigning
    const conflict = await prisma.booking.findFirst({
      where: {
        instructorId,
        tenantId: req.user.tenantId,
        startTime: { lt: booking.endTime },
        endTime: { gt: booking.startTime },
        status: { in: ["APPROVED", "ASSIGNED"] },
      },
    });

    if (conflict) {
      return res.status(400).json({
        message: "Instructor already booked at this time",
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        instructorId,
        status: "ASSIGNED",
      },
    });

    await logAudit({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: "INSTRUCTOR_ASSIGNED",
      entityType: "BOOKING",
      entityId: updated.id,
      beforeState: booking,
      afterState: updated,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error assigning instructor" });
  }
};

/* ===============================
   INSTRUCTOR VIEW BOOKINGS
================================ */
exports.getInstructorBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        instructorId: req.user.userId,
        tenantId: req.user.tenantId,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching instructor bookings" });
  }
};

/* ===============================
   INSTRUCTOR UPDATE STATUS
   (COMPLETED / CANCELLED)
================================ */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const before = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user.tenantId,
      },
    });

    if (!before) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
    });

    await logAudit({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: "BOOKING_STATUS_UPDATED",
      entityType: "BOOKING",
      entityId: booking.id,
      beforeState: before,
      afterState: booking,
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
};
