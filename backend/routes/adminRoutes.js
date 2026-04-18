const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
  getAllStudents,
  getStudentByRegNo,
  getDepartmentOverview,
  getAttendanceReports,
  getPerformanceReports,
  getCounselingReports,
  getAllUsers
} = require("../controllers/adminController");

const {
  verifyToken,
  verifyAdmin
} = require("../middleware/authMiddleware");

router.get("/dashboard", verifyToken, verifyAdmin, getAdminDashboard);
router.get("/students", verifyToken, verifyAdmin, getAllStudents);
router.get("/student/:regNo", verifyToken, verifyAdmin, getStudentByRegNo);
router.get("/departments", verifyToken, verifyAdmin, getDepartmentOverview);
router.get("/attendance", verifyToken, verifyAdmin, getAttendanceReports);
router.get("/performance", verifyToken, verifyAdmin, getPerformanceReports);
router.get("/counseling", verifyToken, verifyAdmin, getCounselingReports);
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

module.exports = router;