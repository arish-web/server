const prisma = require("../../config/db");

/* ===============================
   CREATE AVAILABILITY SLOT
   Role: INSTRUCTOR / ADMIN
=================================*/
exports.createAvailability = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    // 1️⃣ Basic validation
    if (!startTime || !endTime) {
      return res.status(400).json({
        message: "startTime and endTime are required"
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }

    // 2️⃣ Prevent overlapping slots
    const conflict = await prisma.availability.findFirst({
      where: {
        instructorId: req.user.userId,
        tenantId: req.user.tenantId,
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start }
          }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({
        message: "Overlapping availability slot already exists"
      });
    }

    // 3️⃣ Create slot
    const availability = await prisma.availability.create({
      data: {
        instructorId: req.user.userId,
        startTime: start,
        endTime: end,
        tenantId: req.user.tenantId
      }
    });

    res.status(201).json(availability);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating availability" });
  }
};


/* =========================================
   GET AVAILABILITY
   - ADMIN: sees ALL instructors
   - INSTRUCTOR: sees own slots
   - Pagination included
==========================================*/
exports.getInstructorAvailability = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const where = {
      tenantId: req.user.tenantId
    };

    // If NOT admin → only own slots
    if (req.user.role !== "ADMIN") {
      where.instructorId = req.user.userId;
    }

    const total = await prisma.availability.count({ where });

    const slots = await prisma.availability.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        startTime: "asc"
      }
    });

    res.json({
      page,
      limit,
      total,
      data: slots
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching availability" });
  }
};


/* =========================================
   DELETE SLOT (Optional but strong feature)
   Instructor can remove their slot
==========================================*/
exports.deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await prisma.availability.findFirst({
      where: {
        id,
        tenantId: req.user.tenantId
      }
    });

    if (!slot) {
      return res.status(404).json({
        message: "Slot not found"
      });
    }

    // Instructor can delete only own slot
    if (
      req.user.role !== "ADMIN" &&
      slot.instructorId !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Not allowed"
      });
    }

    await prisma.availability.delete({
      where: { id }
    });

    res.json({ message: "Slot deleted" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting slot" });
  }
};
