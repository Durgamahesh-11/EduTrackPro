const express = require("express");
const router = express.Router();

const {
  getMentorStudents,
  getMentorAlerts,
  getMentorStudentByRegNo,
  updateStudentNote
} = require("../controllers/mentorController");

const {
  verifyToken,
  verifyMentor
} = require("../middleware/authMiddleware");

router.get("/students", verifyToken, verifyMentor, getMentorStudents);
router.get("/alerts", verifyToken, verifyMentor, getMentorAlerts);
router.get("/student/:regNo", verifyToken, verifyMentor, getMentorStudentByRegNo);
router.put("/student-note/:id", verifyToken, verifyMentor, updateStudentNote);

module.exports = router;