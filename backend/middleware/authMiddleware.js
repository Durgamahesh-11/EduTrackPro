const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided ❌"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token ❌"
    });
  }
};

const verifyHOD = (req, res, next) => {
  if (!req.user || String(req.user.role || "").toLowerCase() !== "hod") {
    return res.status(403).json({
      message: "Access denied ❌ Only HOD allowed"
    });
  }
  next();
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || String(req.user.role || "").toLowerCase() !== "admin") {
    return res.status(403).json({
      message: "Access denied ❌ Only Admin allowed"
    });
  }
  next();
};

const verifyMentor = (req, res, next) => {
  if (!req.user || String(req.user.role || "").toLowerCase() !== "mentor") {
    return res.status(403).json({
      message: "Access denied ❌ Only Mentor allowed"
    });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyHOD,
  verifyAdmin,
  verifyMentor
};