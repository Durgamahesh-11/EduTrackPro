const db = require("../config/db");

const semesters = ["11", "12", "21", "22", "31", "32", "41", "42"];

const createEmptySubjects = () =>
  Array.from({ length: 8 }, () => ({
    subjectCode: "",
    subjectName: "",
    attendance: {
      month1: "",
      month2: "",
      month3: "",
      month4: "",
      month5: ""
    },
    cie1: "",
    cie2: "",
    viva: "",
    finalGrade: ""
  }));

const createInitialState = () => {
  const state = {};
  semesters.forEach((sem) => {
    state[sem] = {
      subjects: createEmptySubjects(),
      percentage: "",
      sgpa: "",
      cgpa: ""
    };
  });
  return state;
};

const toNumberOrZero = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") {
    return 0;
  }

  const cleaned = String(value).replace("%", "").trim();
  const num = Number(cleaned);
  return Number.isNaN(num) ? 0 : num;
};

const getGradeFromCGPA = (cgpa) => {
  const value = toNumberOrZero(cgpa);

  if (value === 0) return "-";
  if (value >= 9.1 && value <= 10) return "O";
  if (value >= 8.1 && value <= 9.0) return "A+";
  if (value >= 7.1 && value <= 8.0) return "A";
  if (value >= 6.1 && value <= 7.0) return "B+";
  if (value >= 5.1 && value <= 6.0) return "B";
  if (value >= 4.1 && value <= 5.0) return "C";
  if (value > 0 && value <= 4.0) return "F";
  return "-";
};

const savePerformance = (req, res) => {
  const body = req.body || {};
  const { studentEmail, selectedSem, semData, semesterAttendance } = body;

  if (!studentEmail || !selectedSem || !semData) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing ❌"
    });
  }

  const deleteSql = `
    DELETE FROM performance
    WHERE student_email = ? AND semester = ?
  `;

  db.query(deleteSql, [studentEmail, selectedSem], (deleteErr) => {
    if (deleteErr) {
      console.log("Delete performance error:", deleteErr);
      return res.status(500).json({
        success: false,
        message: "Failed to reset semester performance ❌"
      });
    }

    const subjects = Array.isArray(semData.subjects) ? semData.subjects : [];

    const rowsToInsert = subjects.map((subject, index) => [
      studentEmail,
      selectedSem,
      index + 1,
      subject.subjectCode || "",
      subject.subjectName || "",
      subject.attendance?.month1 || "",
      subject.attendance?.month2 || "",
      subject.attendance?.month3 || "",
      subject.attendance?.month4 || "",
      subject.attendance?.month5 || "",
      subject.cie1 || "",
      subject.cie2 || "",
      subject.viva || "",
      subject.finalGrade || ""
    ]);

    const insertSubjects = (callback) => {
      if (rowsToInsert.length === 0) {
        callback();
        return;
      }

      const insertSql = `
        INSERT INTO performance (
          student_email,
          semester,
          row_no,
          subject_code,
          subject_name,
          month1,
          month2,
          month3,
          month4,
          month5,
          cie1,
          cie2,
          viva,
          final_grade
        ) VALUES ?
      `;

      db.query(insertSql, [rowsToInsert], (insertErr) => {
        if (insertErr) {
          console.log("Insert performance rows error:", insertErr);
          return res.status(500).json({
            success: false,
            message: "Failed to save subject performance ❌"
          });
        }

        callback();
      });
    };

    insertSubjects(() => {
      const summarySql = `
        INSERT INTO performance_summary (
          student_email,
          semester,
          percentage,
          sgpa,
          cgpa,
          semester_attendance
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          percentage = VALUES(percentage),
          sgpa = VALUES(sgpa),
          cgpa = VALUES(cgpa),
          semester_attendance = VALUES(semester_attendance)
      `;

      db.query(
        summarySql,
        [
          studentEmail,
          selectedSem,
          semData.percentage || "",
          semData.sgpa || "",
          semData.cgpa || "",
          semesterAttendance || ""
        ],
        (summaryErr) => {
          if (summaryErr) {
            console.log("Save performance summary error:", summaryErr);
            return res.status(500).json({
              success: false,
              message: "Failed to save semester summary ❌"
            });
          }

          const latestAttendance = toNumberOrZero(semesterAttendance);
          const latestCGPA = toNumberOrZero(semData.cgpa);
          const latestGrade = getGradeFromCGPA(latestCGPA);

          const updateStudentSql = `
            UPDATE students
            SET
              attendance = ?,
              cgpa = ?,
              grade = ?
            WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
               OR LOWER(TRIM(email)) = LOWER(TRIM(?))
          `;

          db.query(
            updateStudentSql,
            [
              latestAttendance,
              latestCGPA,
              latestGrade,
              studentEmail,
              studentEmail
            ],
            (updateErr) => {
              if (updateErr) {
                console.log("Update students table error:", updateErr);
                return res.status(500).json({
                  success: false,
                  message: "Performance saved but student sync failed ❌"
                });
              }

              return res.json({
                success: true,
                message: "Performance Record Saved Successfully ✅"
              });
            }
          );
        }
      );
    });
  });
};

const getPerformanceByEmail = (req, res) => {
  const { email } = req.params;

  const subjectSql = `
    SELECT *
    FROM performance
    WHERE student_email = ?
    ORDER BY semester, row_no
  `;

  db.query(subjectSql, [email], (subjectErr, subjectRows) => {
    if (subjectErr) {
      console.log("Fetch performance rows error:", subjectErr);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch performance ❌"
      });
    }

    const summarySql = `
      SELECT *
      FROM performance_summary
      WHERE student_email = ?
    `;

    db.query(summarySql, [email], (summaryErr, summaryRows) => {
      if (summaryErr) {
        console.log("Fetch performance summary error:", summaryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch performance summary ❌"
        });
      }

      const responseData = createInitialState();

      subjectRows.forEach((row) => {
        const sem = row.semester;
        const index = Math.max(0, (row.row_no || 1) - 1);

        if (!responseData[sem]) return;

        if (!responseData[sem].subjects[index]) {
          responseData[sem].subjects[index] = createEmptySubjects()[0];
        }

        responseData[sem].subjects[index] = {
          subjectCode: row.subject_code || "",
          subjectName: row.subject_name || "",
          attendance: {
            month1: row.month1 || "",
            month2: row.month2 || "",
            month3: row.month3 || "",
            month4: row.month4 || "",
            month5: row.month5 || ""
          },
          cie1: row.cie1 || "",
          cie2: row.cie2 || "",
          viva: row.viva || "",
          finalGrade: row.final_grade || ""
        };
      });

      summaryRows.forEach((row) => {
        const sem = row.semester;
        if (!responseData[sem]) return;

        responseData[sem].percentage = row.percentage || "";
        responseData[sem].sgpa = row.sgpa || "";
        responseData[sem].cgpa = row.cgpa || "";
      });

      return res.json({
        success: true,
        data: responseData
      });
    });
  });
};

module.exports = {
  savePerformance,
  getPerformanceByEmail
};