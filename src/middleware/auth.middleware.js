const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, "SECRET_KEY");

    req.user = decoded;
    // req.user = { userId, role, tenantId }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
