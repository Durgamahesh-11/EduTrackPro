const db = require("../config/db");

const addActivity = (req, res) => {
  const { studentEmail, category, yearSemester, topicDetails, venue } = req.body || {};

  if (!studentEmail || !category || !yearSemester || !topicDetails || !venue) {
    return res.status(400).json({
      success: false,
      message: "Please fill all activity fields ❌"
    });
  }

  const sql = `
    INSERT INTO activities (
      student_email,
      category,
      year_semester,
      topic_details,
      venue
    ) VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [studentEmail, category, yearSemester, topicDetails, venue],
    (err, result) => {
      if (err) {
        console.log("Add activity error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to add activity ❌"
        });
      }

      return res.json({
        success: true,
        message: "Activity added successfully ✅",
        id: result.insertId
      });
    }
  );
};

const getActivities = (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT * FROM activities
    WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
    ORDER BY id DESC
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Fetch activities error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch activities ❌"
      });
    }

    return res.json({
      success: true,
      data: result
    });
  });
};

const addExam = (req, res) => {
  const { studentEmail, examName, examScore } = req.body || {};

  if (!studentEmail || !examName || !examScore) {
    return res.status(400).json({
      success: false,
      message: "Please fill exam details ❌"
    });
  }

  const sql = `
    INSERT INTO competitive_exams (
      student_email,
      exam_name,
      exam_score
    ) VALUES (?, ?, ?)
  `;

  db.query(sql, [studentEmail, examName, examScore], (err, result) => {
    if (err) {
      console.log("Add exam error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to add exam record ❌"
      });
    }

    return res.json({
      success: true,
      message: "Exam record added successfully ✅",
      id: result.insertId
    });
  });
};

const getExams = (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT * FROM competitive_exams
    WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
    ORDER BY id DESC
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Fetch exams error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch exam records ❌"
      });
    }

    return res.json({
      success: true,
      data: result
    });
  });
};

module.exports = {
  addActivity,
  getActivities,
  addExam,
  getExams
};