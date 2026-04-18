const express = require("express");
const router = express.Router();

const {
  addCertification,
  getCertifications
} = require("../controllers/certificationController");

router.post("/", addCertification);
router.get("/:email", getCertifications);

module.exports = router;