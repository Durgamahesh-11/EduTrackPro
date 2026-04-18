const express = require("express");
const router = express.Router();
const {
  savePerformance,
  getPerformanceByEmail
} = require("../controllers/performanceController");

router.post("/", savePerformance);
router.get("/:email", getPerformanceByEmail);

module.exports = router;