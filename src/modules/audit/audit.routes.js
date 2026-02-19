const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");
const { getAuditLogs } = require("./audit.controller");

router.get("/", auth, role(["ADMIN"]), getAuditLogs);

module.exports = router;
