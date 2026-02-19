const prisma = require("../../config/db");

exports.createModule = async (req, res) => {
  try {
    const { title, courseId } = req.body;

    const module = await prisma.module.create({
      data: {
        title,
        courseId,
        tenantId: req.user.tenantId
      }
    });

    res.json(module);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating module" });
  }
};

exports.getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const modules = await prisma.module.findMany({
      where: {
        courseId,
        tenantId: req.user.tenantId
      }
    });

    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: "Error fetching modules" });
  }
};
