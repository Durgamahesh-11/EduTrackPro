const express = require("express");
const router = express.Router();

const {
  saveCounseling,
  getCounseling
} = require("../controllers/counselingController");

router.post("/", saveCounseling);
router.get("/:email", getCounseling);

module.exports = router;