const express = require("express");
const router = express.Router();

const {
  getHODStudents,
  getHODDashboard,
  getHODAlerts,
  getStudentById
} = require("../controllers/hodController");

const { verifyToken, verifyHOD } = require("../middleware/authMiddleware");

router.get("/students", verifyToken, verifyHOD, getHODStudents);
router.get("/dashboard", verifyToken, verifyHOD, getHODDashboard);
router.get("/alerts", verifyToken, verifyHOD, getHODAlerts);
router.get("/student/:id", verifyToken, verifyHOD, getStudentById);

module.exports = router;