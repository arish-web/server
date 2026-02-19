const prisma = require("../../config/db");

exports.createQuiz = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        tenantId: req.user.tenantId
      }
    });

    res.json(quiz);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating quiz" });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { quizId, questionText, options, correctAnswer } = req.body;

    const question = await prisma.question.create({
      data: {
        quizId,
        questionText,
        options,
        correctAnswer,
        tenantId: req.user.tenantId
      }
    });

    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Error adding question" });
  }
};

exports.attemptQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    // answers example:
    // { "questionId": "selectedOption", ... }

    const questions = await prisma.question.findMany({
      where: {
        quizId,
        tenantId: req.user.tenantId
      }
    });

    let score = 0;

    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: req.user.userId,
        quizId,
        answers,
        score,
        tenantId: req.user.tenantId
      }
    });

    res.json({
      score,
      total: questions.length
    });

  } catch (err) {
    res.status(500).json({ message: "Error attempting quiz" });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        tenantId: req.user.tenantId
      },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching quiz" });
  }
};



exports.submitQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correct = 0;

    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);

    await prisma.quizAttempt.create({
      data: {
        studentId: req.user.userId,
        quizId: id,
        answers,
        score,
        tenantId: req.user.tenantId
      }
    });

    res.json({ score, correct, total });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Submission failed" });
  }
};


exports.getQuizAttempts = async (req, res) => {
  try {
    const { id } = req.params; // quizId

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: id,
        studentId: req.user.userId, // only this student's attempts
        tenantId: req.user.tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        score: true,
        createdAt: true,
      },
    });

    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};

