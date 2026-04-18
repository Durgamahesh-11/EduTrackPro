const express = require("express");
const router = express.Router();

const {
  saveProjects,
  getProjects
} = require("../controllers/projectController");

router.post("/", saveProjects);
router.get("/:email", getProjects);

module.exports = router;