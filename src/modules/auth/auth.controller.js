const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      "SECRET_KEY",
      { expiresIn: "1h" },
    );

    res.json({
      token,
      role: user.role,
      userId: user.id,
      tenantId: user.tenantId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getInstructors = async (req, res) => {
  try {
    const instructors = await prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        tenantId: req.user.tenantId
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    res.json(instructors);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching instructors" });
  }
};
