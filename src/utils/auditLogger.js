const prisma = require("../config/db");

exports.logAudit = async ({
  userId,
  tenantId,
  action,
  entityType,
  entityId,
  beforeState = null,
  afterState = null
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        tenantId,
        action,
        entityType,
        entityId,
        beforeState,
        afterState,
        correlationId: Date.now().toString()
      }
    });
  } catch (err) {
    console.log("Audit log failed:", err.message);
  }
};
