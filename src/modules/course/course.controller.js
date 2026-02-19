const prisma = require("../../config/db");

exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructorId: req.user.userId,
        tenantId: req.user.tenantId
      }
    });

    res.json(course);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating course" });
  }
};

exports.getCourses = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

const courses = await prisma.course.findMany({
  where: { tenantId: req.user.tenantId },
  skip: (page - 1) * limit,
  take: limit,
  include: {
    modules: {
      include: {
        lessons: {
          include: {
            quiz: true
          }
        }
      }
    }
  }
});


  const total = await prisma.course.count({
    where: { tenantId: req.user.tenantId }
  });

  res.json({
    page,
    limit,
    total,
    data: courses
  });
};
