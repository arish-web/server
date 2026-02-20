const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.passwordHash);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       {
//         userId: user.id,
//         role: user.role,
//         tenantId: user.tenantId,
//       },
//       "SECRET_KEY",
//       { expiresIn: "1h" },
//     );

//     res.json({
//       token,
//       role: user.role,
//       userId: user.id,
//       tenantId: user.tenantId,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


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

    // 🔥 ACCESS TOKEN (20 seconds)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.ACCESS_SECRET,
      { expiresIn: "20s" }
    );

    // 🔥 REFRESH TOKEN (7 days)
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      accessToken,
      refreshToken,
      role: user.role,
      userId: user.id,
      tenantId: user.tenantId,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

 exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.ACCESS_SECRET,
      { expiresIn: "20s" }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
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
