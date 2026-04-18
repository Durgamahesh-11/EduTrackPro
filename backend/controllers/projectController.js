const db = require("../config/db");

const saveProjects = (req, res) => {
  const { studentEmail, miniProject, majorProject } = req.body || {};

  if (!studentEmail) {
    return res.status(400).json({
      success: false,
      message: "Student email is required ❌"
    });
  }

  const sql = `
    INSERT INTO projects (
      student_email,
      mini_title,
      mini_guide,
      mini_organization,
      major_title,
      major_guide,
      major_organization
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      mini_title = VALUES(mini_title),
      mini_guide = VALUES(mini_guide),
      mini_organization = VALUES(mini_organization),
      major_title = VALUES(major_title),
      major_guide = VALUES(major_guide),
      major_organization = VALUES(major_organization)
  `;

  db.query(
    sql,
    [
      studentEmail,
      miniProject?.title || "",
      miniProject?.guide || "",
      miniProject?.organization || "",
      majorProject?.title || "",
      majorProject?.guide || "",
      majorProject?.organization || ""
    ],
    (err) => {
      if (err) {
        console.log("Save projects error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to save projects ❌"
        });
      }

      return res.json({
        success: true,
        message: "Projects saved successfully ✅"
      });
    }
  );
};

const getProjects = (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT * FROM projects
    WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
    LIMIT 1
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Fetch projects error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch projects ❌"
      });
    }

    return res.json({
      success: true,
      data: result[0] || null
    });
  });
};

module.exports = {
  saveProjects,
  getProjects
};