const prisma = require("../../config/db");

exports.createLesson = async (req, res) => {
  try {
    const { title, type, content, moduleId } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        type,        // TEXT or QUIZ
        content,     // used only for TEXT
        moduleId,
        tenantId: req.user.tenantId
      }
    });

    res.json(lesson);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating lesson" });
  }
};

exports.getLessonsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const lessons = await prisma.lesson.findMany({
      where: {
        moduleId,
        tenantId: req.user.tenantId
      }
    });

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lessons" });
  }
};

exports.getLessons = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const lessons = await prisma.lesson.findMany({
      where: {
        tenantId: req.user.tenantId
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        title: "asc"
      }
    });

    const total = await prisma.lesson.count({
      where: {
        tenantId: req.user.tenantId
      }
    });

    res.json({
      page,
      limit,
      total,
      data: lessons
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching lessons" });
  }
};


