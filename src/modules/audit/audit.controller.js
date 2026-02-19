const prisma = require("../../config/db");

exports.getAuditLogs = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        tenantId: req.user.tenantId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching audit logs" });
  }
};
