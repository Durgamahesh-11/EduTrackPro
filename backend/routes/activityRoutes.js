const express = require("express");
const router = express.Router();

const {
  addActivity,
  getActivities,
  addExam,
  getExams
} = require("../controllers/activityController");

router.post("/", addActivity);
router.get("/:email", getActivities);

router.post("/exam", addExam);
router.get("/exam/:email", getExams);

module.exports = router;