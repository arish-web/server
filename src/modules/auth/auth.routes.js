const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");

const {
  login,
  refreshToken,
  getInstructors
} = require("./auth.controller");

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

router.post("/login", login);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (require token)
|--------------------------------------------------------------------------
*/

// Get all instructors for the same tenant
router.get("/instructors", auth, getInstructors);

router.post("/refresh", refreshToken);

module.exports = router;

