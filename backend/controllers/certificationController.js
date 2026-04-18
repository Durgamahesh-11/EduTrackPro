const db = require("../config/db");

const addCertification = (req, res) => {
  const { studentEmail, yearSemester, activityDetails, venue, type } = req.body || {};

  if (!studentEmail || !yearSemester || !activityDetails || !venue || !type) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields ❌"
    });
  }

  const sql = `
    INSERT INTO certifications (
      student_email,
      year_semester,
      activity_details,
      venue,
      type
    ) VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [studentEmail, yearSemester, activityDetails, venue, type],
    (err, result) => {
      if (err) {
        console.log("Add certification error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to add record ❌"
        });
      }

      return res.json({
        success: true,
        message: "Record added successfully ✅",
        id: result.insertId
      });
    }
  );
};

const getCertifications = (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT * FROM certifications
    WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
    ORDER BY id DESC
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Fetch certifications error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch records ❌"
      });
    }

    return res.json({
      success: true,
      data: result
    });
  });
};

module.exports = {
  addCertification,
  getCertifications
};