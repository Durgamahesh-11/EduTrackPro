const db = require("../config/db");

const getGradeFromCGPA = (cgpa) => {
  const value = Number(cgpa);

  if (Number.isNaN(value) || value <= 0) return "-";
  if (value >= 9.1 && value <= 10) return "O";
  if (value >= 8.1 && value <= 9.0) return "A+";
  if (value >= 7.1 && value <= 8.0) return "A";
  if (value >= 6.1 && value <= 7.0) return "B+";
  if (value >= 5.1 && value <= 6.0) return "B";
  if (value >= 4.1 && value <= 5.0) return "C";
  if (value > 0 && value <= 4.0) return "F";
  return "-";
};

const getMentorStudents = async (req, res) => {
  try {
    const mentorEmail = String(req.user.email || "").trim().toLowerCase();

    const query = `
      SELECT
        s.id,
        s.student_name,
        s.name,
        s.roll_no,
        s.reg_no,
        s.ht_no,
        s.email,
        s.student_email,
        s.department,
        s.branch,
        s.section,
        s.year,
        CASE
          WHEN ps.semester_attendance IS NOT NULL AND ps.semester_attendance <> ''
          THEN ps.semester_attendance
          ELSE s.attendance
        END AS attendance,
        CASE
          WHEN ps.cgpa IS NOT NULL AND ps.cgpa <> ''
          THEN ps.cgpa
          ELSE s.cgpa
        END AS cgpa,
        s.grade,
        s.mentor_name,
        s.mentor_email,
        s.hod_name,
        s.hod_email,
        s.counseling_note
      FROM students s
      LEFT JOIN (
        SELECT p1.student_email, p1.semester_attendance, p1.cgpa, p1.semester
        FROM performance_summary p1
        INNER JOIN (
          SELECT student_email, MAX(CAST(semester AS UNSIGNED)) AS latest_sem
          FROM performance_summary
          GROUP BY student_email
        ) p2
          ON p1.student_email = p2.student_email
         AND CAST(p1.semester AS UNSIGNED) = p2.latest_sem
      ) ps
        ON LOWER(TRIM(ps.student_email)) = LOWER(TRIM(s.student_email))
      WHERE LOWER(TRIM(s.mentor_email)) = ?
      ORDER BY s.department ASC, s.section ASC, s.student_name ASC, s.roll_no ASC
    `;

    const [rows] = await db.promise().query(query, [mentorEmail]);

    const formattedRows = rows.map((student) => {
      const cgpaValue =
        student.cgpa !== null && student.cgpa !== undefined && student.cgpa !== ""
          ? Number(student.cgpa)
          : 0;

      const attendanceValue =
        student.attendance !== null &&
        student.attendance !== undefined &&
        student.attendance !== ""
          ? Number(student.attendance)
          : 0;

      return {
        ...student,
        attendance: Number.isNaN(attendanceValue) ? 0 : attendanceValue,
        cgpa: Number.isNaN(cgpaValue) ? 0 : cgpaValue,
        grade:
          student.grade && student.grade !== "-"
            ? student.grade
            : getGradeFromCGPA(cgpaValue)
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.log("Error in getMentorStudents:", error);
    return res.status(500).json({
      message: "Failed to fetch mentor students ❌",
      error: error.message
    });
  }
};

const getMentorAlerts = async (req, res) => {
  try {
    const mentorEmail = String(req.user.email || "").trim().toLowerCase();

    const query = `
      SELECT
        s.id,
        s.student_name,
        s.name,
        s.roll_no,
        s.reg_no,
        s.ht_no,
        s.email,
        s.student_email,
        s.department,
        s.branch,
        s.section,
        s.year,
        CASE
          WHEN ps.semester_attendance IS NOT NULL AND ps.semester_attendance <> ''
          THEN ps.semester_attendance
          ELSE s.attendance
        END AS attendance,
        CASE
          WHEN ps.cgpa IS NOT NULL AND ps.cgpa <> ''
          THEN ps.cgpa
          ELSE s.cgpa
        END AS cgpa,
        s.grade,
        s.mentor_name,
        s.mentor_email,
        s.hod_name,
        s.hod_email,
        s.counseling_note
      FROM students s
      LEFT JOIN (
        SELECT p1.student_email, p1.semester_attendance, p1.cgpa, p1.semester
        FROM performance_summary p1
        INNER JOIN (
          SELECT student_email, MAX(CAST(semester AS UNSIGNED)) AS latest_sem
          FROM performance_summary
          GROUP BY student_email
        ) p2
          ON p1.student_email = p2.student_email
         AND CAST(p1.semester AS UNSIGNED) = p2.latest_sem
      ) ps
        ON LOWER(TRIM(ps.student_email)) = LOWER(TRIM(s.student_email))
      WHERE LOWER(TRIM(s.mentor_email)) = ?
        AND CAST(
          CASE
            WHEN ps.semester_attendance IS NOT NULL AND ps.semester_attendance <> ''
            THEN ps.semester_attendance
            ELSE s.attendance
          END AS DECIMAL(10,2)
        ) < 75
      ORDER BY CAST(
        CASE
          WHEN ps.semester_attendance IS NOT NULL AND ps.semester_attendance <> ''
          THEN ps.semester_attendance
          ELSE s.attendance
        END AS DECIMAL(10,2)
      ) ASC, s.student_name ASC
    `;

    const [rows] = await db.promise().query(query, [mentorEmail]);

    const formattedRows = rows.map((student) => {
      const cgpaValue =
        student.cgpa !== null && student.cgpa !== undefined && student.cgpa !== ""
          ? Number(student.cgpa)
          : 0;

      const attendanceValue =
        student.attendance !== null &&
        student.attendance !== undefined &&
        student.attendance !== ""
          ? Number(student.attendance)
          : 0;

      return {
        ...student,
        attendance: Number.isNaN(attendanceValue) ? 0 : attendanceValue,
        cgpa: Number.isNaN(cgpaValue) ? 0 : cgpaValue,
        grade:
          student.grade && student.grade !== "-"
            ? student.grade
            : getGradeFromCGPA(cgpaValue)
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.log("Error in getMentorAlerts:", error);
    return res.status(500).json({
      message: "Failed to fetch mentor alerts ❌",
      error: error.message
    });
  }
};

const getMentorStudentByRegNo = async (req, res) => {
  try {
    const mentorEmail = String(req.user.email || "").trim().toLowerCase();
    const regNo = decodeURIComponent(String(req.params.regNo || "").trim());

    const query = `
      SELECT
        s.*,
        CASE
          WHEN ps.semester_attendance IS NOT NULL AND ps.semester_attendance <> ''
          THEN ps.semester_attendance
          ELSE s.attendance
        END AS attendance,
        CASE
          WHEN ps.cgpa IS NOT NULL AND ps.cgpa <> ''
          THEN ps.cgpa
          ELSE s.cgpa
        END AS cgpa
      FROM students s
      LEFT JOIN (
        SELECT p1.student_email, p1.semester_attendance, p1.cgpa, p1.semester
        FROM performance_summary p1
        INNER JOIN (
          SELECT student_email, MAX(CAST(semester AS UNSIGNED)) AS latest_sem
          FROM performance_summary
          GROUP BY student_email
        ) p2
          ON p1.student_email = p2.student_email
         AND CAST(p1.semester AS UNSIGNED) = p2.latest_sem
      ) ps
        ON LOWER(TRIM(ps.student_email)) = LOWER(TRIM(s.student_email))
      WHERE LOWER(TRIM(s.mentor_email)) = ?
        AND (
          TRIM(s.roll_no) = ?
          OR TRIM(s.reg_no) = ?
          OR TRIM(s.ht_no) = ?
        )
      LIMIT 1
    `;

    const [rows] = await db.promise().query(query, [mentorEmail, regNo, regNo, regNo]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Student not found or not assigned to this mentor ❌"
      });
    }

    const student = rows[0];
    const cgpaValue =
      student.cgpa !== null && student.cgpa !== undefined && student.cgpa !== ""
        ? Number(student.cgpa)
        : 0;

    const attendanceValue =
      student.attendance !== null &&
      student.attendance !== undefined &&
      student.attendance !== ""
        ? Number(student.attendance)
        : 0;

    const formattedStudent = {
      ...student,
      attendance: Number.isNaN(attendanceValue) ? 0 : attendanceValue,
      cgpa: Number.isNaN(cgpaValue) ? 0 : cgpaValue,
      grade:
        student.grade && student.grade !== "-"
          ? student.grade
          : getGradeFromCGPA(cgpaValue)
    };

    return res.status(200).json(formattedStudent);
  } catch (error) {
    console.log("Error in getMentorStudentByRegNo:", error);
    return res.status(500).json({
      message: "Failed to fetch student full details ❌",
      error: error.message
    });
  }
};

const updateStudentNote = async (req, res) => {
  try {
    const mentorEmail = String(req.user.email || "").trim().toLowerCase();
    const studentId = req.params.id;
    const counseling_note = String(req.body.counseling_note || "").trim();

    if (!counseling_note) {
      return res.status(400).json({
        message: "Counseling note is required ❌"
      });
    }

    const checkQuery = `
      SELECT id
      FROM students
      WHERE id = ?
        AND LOWER(TRIM(mentor_email)) = ?
      LIMIT 1
    `;

    const [studentRows] = await db.promise().query(checkQuery, [
      studentId,
      mentorEmail
    ]);

    if (studentRows.length === 0) {
      return res.status(404).json({
        message: "Student not found or not assigned to this mentor ❌"
      });
    }

    const updateQuery = `
      UPDATE students
      SET counseling_note = ?
      WHERE id = ?
    `;

    await db.promise().query(updateQuery, [counseling_note, studentId]);

    return res.status(200).json({
      success: true,
      message: "Note updated successfully ✅"
    });
  } catch (error) {
    console.log("Error in updateStudentNote:", error);
    return res.status(500).json({
      message: "Failed to update counseling note ❌",
      error: error.message
    });
  }
};

module.exports = {
  getMentorStudents,
  getMentorAlerts,
  getMentorStudentByRegNo,
  updateStudentNote
};