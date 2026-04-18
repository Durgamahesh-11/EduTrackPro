const express = require("express");
const router = express.Router();

const {
  registerStudent,
  getStudentProfile,
  updateStudentProfile
} = require("../controllers/studentController");

router.post("/register", registerStudent);
router.get("/profile/:email", getStudentProfile);
router.put("/profile/:email", updateStudentProfile);

module.exports = router;