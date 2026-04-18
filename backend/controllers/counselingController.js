const db = require("../config/db");

const saveCounseling = (req, res) => {
  const { studentEmail, counselorName, department, notes } = req.body || {};

  if (!studentEmail || !counselorName || !department || !notes) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields ❌"
    });
  }

  const sql = `
    INSERT INTO counseling (
      student_email,
      counselor_name,
      department,
      notes
    ) VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      counselor_name = VALUES(counselor_name),
      department = VALUES(department),
      notes = VALUES(notes)
  `;

  db.query(sql, [studentEmail, counselorName, department, notes], (err) => {
    if (err) {
      console.log("Save counseling error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to save counseling details ❌"
      });
    }

    return res.json({
      success: true,
      message: "Counseling details saved successfully ✅"
    });
  });
};

const getCounseling = (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT * FROM counseling
    WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
    LIMIT 1
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Fetch counseling error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch counseling details ❌"
      });
    }

    return res.json({
      success: true,
      data: result[0] || null
    });
  });
};

module.exports = {
  saveCounseling,
  getCounseling
};