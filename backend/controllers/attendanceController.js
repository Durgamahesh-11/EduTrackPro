const db = require("../config/db");

const saveAttendance = (req, res) => {
  const body = req.body || {};

  const {
    studentEmail,
    sem11,
    sem12,
    sem21,
    sem22,
    sem31,
    sem32,
    sem41,
    sem42
  } = body;

  if (!studentEmail) {
    return res.status(400).json({
      success: false,
      message: "Student email is required ❌"
    });
  }

  const checkSql = "SELECT * FROM attendance WHERE student_email = ?";

  db.query(checkSql, [studentEmail], (checkErr, checkResult) => {
    if (checkErr) {
      console.log("Attendance check error:", checkErr);
      return res.status(500).json({
        success: false,
        message: "Server error ❌"
      });
    }

    if (checkResult.length > 0) {
      const updateSql = `
        UPDATE attendance
        SET sem11 = ?, sem12 = ?, sem21 = ?, sem22 = ?, sem31 = ?, sem32 = ?, sem41 = ?, sem42 = ?
        WHERE student_email = ?
      `;

      db.query(
        updateSql,
        [sem11, sem12, sem21, sem22, sem31, sem32, sem41, sem42, studentEmail],
        (updateErr) => {
          if (updateErr) {
            console.log("Attendance update error:", updateErr);
            return res.status(500).json({
              success: false,
              message: "Attendance update failed ❌"
            });
          }

          return res.json({
            success: true,
            message: "Attendance updated successfully ✅"
          });
        }
      );
    } else {
      const insertSql = `
        INSERT INTO attendance (
          student_email,
          sem11,
          sem12,
          sem21,
          sem22,
          sem31,
          sem32,
          sem41,
          sem42
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [studentEmail, sem11, sem12, sem21, sem22, sem31, sem32, sem41, sem42],
        (insertErr) => {
          if (insertErr) {
            console.log("Attendance insert error:", insertErr);
            return res.status(500).json({
              success: false,
              message: "Attendance save failed ❌"
            });
          }

          return res.json({
            success: true,
            message: "Attendance saved successfully ✅"
          });
        }
      );
    }
  });
};

const getAttendanceByEmail = (req, res) => {
  const { email } = req.params;

  const sql = "SELECT * FROM attendance WHERE student_email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Fetch attendance error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch attendance ❌"
      });
    }

    if (result.length > 0) {
      return res.json({
        success: true,
        data: result[0]
      });
    }

    return res.json({
      success: true,
      data: {
        sem11: "",
        sem12: "",
        sem21: "",
        sem22: "",
        sem31: "",
        sem32: "",
        sem41: "",
        sem42: ""
      }
    });
  });
};

module.exports = {
  saveAttendance,
  getAttendanceByEmail
};