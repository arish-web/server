const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");

const {
  createQuiz,
  addQuestion,
  attemptQuiz,
  getQuizById,
  submitQuizAttempt,
  getQuizAttempts
} = require("./quiz.controller");

router.post("/", auth, role(["ADMIN", "INSTRUCTOR"]), createQuiz);

router.get("/:id", auth, getQuizById);

router.post("/:id/attempt", auth, submitQuizAttempt);

router.get("/:id/attempts", auth, role(["STUDENT"]), getQuizAttempts);

router.post("/question", auth, role(["ADMIN", "INSTRUCTOR"]), addQuestion);

router.post("/attempt", auth, role(["STUDENT", "ADMIN", "INSTRUCTOR"]), attemptQuiz);

module.exports = router;
