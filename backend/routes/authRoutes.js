const express = require("express");
const router = express.Router();
const { loginUser, registerStudent } = require("../controllers/authController");

router.get("/login", (req, res) => {
  res.send("Auth route working ✅ Use POST for real login");
});

router.post("/login", loginUser);
router.post("/register", registerStudent);

module.exports = router;