const express = require("express");
const router = express.Router();
const {
  saveAttendance,
  getAttendanceByEmail
} = require("../controllers/attendanceController");

router.post("/", saveAttendance);
router.get("/:email", getAttendanceByEmail);

module.exports = router;