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

const getHodDepartment = (email, callback) => {
  const getDeptSql = `
    SELECT department
    FROM users
    WHERE LOWER(email) = LOWER(?)
    LIMIT 1
  `;

  db.query(getDeptSql, [email], (err, rows) => {
    if (err) {
      console.log("HOD department fetch error:", err);
      callback(err, null);
      return;
    }

    if (!rows.length) {
      callback(new Error("HOD not found"), null);
      return;
    }

    callback(null, rows[0].department || "");
  });
};

const getStudentsQuery = `
  SELECT
    s.id,
    s.user_id,
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
    s.year_of_admission,
    s.date_of_birth,
    s.intermediate_marks,
    s.eamcet_ecet_rank,
    s.address,
    s.phone_r,
    s.parent_guardian_name,
    s.designation_profession,
    s.organization_name,
    s.parent_email,
    s.parent_mobile,
    s.blood_group,
    s.medical_problems,
    s.important_medicines,
    s.language_read,
    s.language_write,
    s.language_speak,
    s.professional_societies,
    s.btech_marks_and_passing_year,
    s.placement,
    s.higher_studies,
    s.student_signature,
    s.counselor_1st_year,
    s.counselor_2nd_year,
    s.counselor_3rd_year,
    s.counselor_4th_year,
    s.mentor_name,
    s.mentor_email,
    s.hod_name,
    s.hod_email,
    s.counseling_note,
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
    CASE
      WHEN ps.percentage IS NOT NULL AND ps.percentage <> ''
      THEN ps.percentage
      ELSE NULL
    END AS percentage,
    s.grade
  FROM students s
  LEFT JOIN (
    SELECT p1.student_email, p1.semester_attendance, p1.cgpa, p1.percentage, p1.semester
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
  WHERE s.department = ?
`;

const formatStudent = (student) => {
  const attendanceValue =
    student.attendance !== null &&
    student.attendance !== undefined &&
    student.attendance !== ""
      ? Number(student.attendance)
      : 0;

  const cgpaValue =
    student.cgpa !== null &&
    student.cgpa !== undefined &&
    student.cgpa !== ""
      ? Number(student.cgpa)
      : 0;

  const percentageValue =
    student.percentage !== null &&
    student.percentage !== undefined &&
    student.percentage !== ""
      ? Number(student.percentage)
      : null;

  return {
    ...student,
    attendance: Number.isNaN(attendanceValue) ? 0 : attendanceValue,
    cgpa: Number.isNaN(cgpaValue) ? 0 : cgpaValue,
    percentage: Number.isNaN(percentageValue) ? null : percentageValue,
    grade:
      student.grade && student.grade !== "-"
        ? student.grade
        : getGradeFromCGPA(cgpaValue)
  };
};

const getHODStudents = (req, res) => {
  const email = String(req.user.email || "").trim().toLowerCase();

  getHodDepartment(email, (deptErr, dept) => {
    if (deptErr) {
      return res.status(500).json({ message: "Server error ❌" });
    }

    const sql = `${getStudentsQuery} ORDER BY s.section ASC, s.roll_no ASC`;

    db.query(sql, [dept], (studentErr, students) => {
      if (studentErr) {
        console.log("HOD students fetch error:", studentErr);
        return res.status(500).json({ message: "Server error ❌" });
      }

      return res.json((students || []).map(formatStudent));
    });
  });
};

const getHODDashboard = (req, res) => {
  const email = String(req.user.email || "").trim().toLowerCase();

  getHodDepartment(email, (deptErr, dept) => {
    if (deptErr) {
      return res.status(500).json({ message: "Server error ❌" });
    }

    const sql = `${getStudentsQuery} ORDER BY s.section ASC, s.roll_no ASC`;

    db.query(sql, [dept], (studentErr, students) => {
      if (studentErr) {
        console.log("HOD dashboard fetch error:", studentErr);
        return res.status(500).json({ message: "Server error ❌" });
      }

      const formattedStudents = (students || []).map(formatStudent);

      const validAttendance = formattedStudents.filter((s) => s.attendance > 0);
      const validCgpa = formattedStudents.filter((s) => s.cgpa > 0);

      const total = formattedStudents.length;

      const avgAttendance = validAttendance.length
        ? (
            validAttendance.reduce((sum, s) => sum + s.attendance, 0) /
            validAttendance.length
          ).toFixed(1)
        : "0.0";

      const avgCGPA = validCgpa.length
        ? (
            validCgpa.reduce((sum, s) => sum + s.cgpa, 0) /
            validCgpa.length
          ).toFixed(2)
        : "0.00";

      const lowAttendanceStudents = formattedStudents
        .filter((s) => s.attendance > 0 && s.attendance < 75)
        .sort((a, b) => a.attendance - b.attendance);

      const lowPerformanceStudents = formattedStudents
        .filter((s) => s.cgpa > 0 && s.cgpa < 6)
        .sort((a, b) => a.cgpa - b.cgpa);

      const highPerformers = formattedStudents.filter((s) => s.cgpa >= 8).length;
      const avgPerformers = formattedStudents.filter(
        (s) => s.cgpa >= 6 && s.cgpa < 8
      ).length;

      return res.json({
        total,
        avgAttendance,
        avgCGPA,
        lowAttendance: lowAttendanceStudents.length,
        highPerformers,
        avgPerformers,
        lowPerformers: lowPerformanceStudents.length,
        lowAttendanceStudents,
        lowPerformanceStudents,
        students: formattedStudents
      });
    });
  });
};

const getHODAlerts = (req, res) => {
  const email = String(req.user.email || "").trim().toLowerCase();

  getHodDepartment(email, (deptErr, dept) => {
    if (deptErr) {
      return res.status(500).json({ message: "Server error ❌" });
    }

    const sql = `${getStudentsQuery}
      AND (
        CAST(
          CASE
            WHEN (
              SELECT p1.semester_attendance
              FROM performance_summary p1
              INNER JOIN (
                SELECT student_email, MAX(CAST(semester AS UNSIGNED)) AS latest_sem
                FROM performance_summary
                GROUP BY student_email
              ) p2
                ON p1.student_email = p2.student_email
               AND CAST(p1.semester AS UNSIGNED) = p2.latest_sem
              WHERE LOWER(TRIM(p1.student_email)) = LOWER(TRIM(s.student_email))
              LIMIT 1
            ) IS NOT NULL
            THEN (
              SELECT p1.semester_attendance
              FROM performance_summary p1
              INNER JOIN (
                SELECT student_email, MAX(CAST(semester AS UNSIGNED)) AS latest_sem
                FROM performance_summary
                GROUP BY student_email
              ) p2
                ON p1.student_email = p2.student_email
               AND CAST(p1.semester AS UNSIGNED) = p2.latest_sem
              WHERE LOWER(TRIM(p1.student_email)) = LOWER(TRIM(s.student_email))
              LIMIT 1
            )
            ELSE s.attendance
          END AS DECIMAL(10,2)
        ) < 75
        OR
        CAST(
          CASE
            WHEN (
              SELECT p1.cgpa
              FROM performance_summary p1
              INNER JOIN (
                SELECT student_email, MAX(CAST(semester AS UNSIGNED)) AS latest_sem
                FROM performance_summary
                GROUP BY student_email
              ) p2
                ON p1.student_email = p2.student_email
               AND CAST(p1.semester AS UNSIGNED) = p2.latest_sem
              WHERE LOWER(TRIM(p1.student_email)) = LOWER(TRIM(s.student_email))
              LIMIT 1
            ) IS NOT NULL
            THEN (
              SELECT p1.cgpa
              FROM performance_summary p1
              INNER JOIN (
                SELECT student_email, MAX(CAST(semester AS UNSIGNED)) AS latest_sem
                FROM performance_summary
                GROUP BY student_email
              ) p2
                ON p1.student_email = p2.student_email
               AND CAST(p1.semester AS UNSIGNED) = p2.latest_sem
              WHERE LOWER(TRIM(p1.student_email)) = LOWER(TRIM(s.student_email))
              LIMIT 1
            )
            ELSE s.cgpa
          END AS DECIMAL(10,2)
        ) < 6
      )
      ORDER BY s.section ASC, s.roll_no ASC`;

    db.query(sql, [dept], (alertErr, data) => {
      if (alertErr) {
        console.log("HOD alerts fetch error:", alertErr);
        return res.status(500).json({ message: "Server error ❌" });
      }

      return res.json((data || []).map(formatStudent));
    });
  });
};

const getStudentById = (req, res) => {
  const { id } = req.params;
  const email = String(req.user.email || "").trim().toLowerCase();

  getHodDepartment(email, (deptErr, dept) => {
    if (deptErr) {
      return res.status(500).json({ message: "Server error ❌" });
    }

    const sql = `
      SELECT
        s.id,
        s.user_id,
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
        s.year_of_admission,
        s.date_of_birth,
        s.intermediate_marks,
        s.eamcet_ecet_rank,
        s.address,
        s.phone_r,
        s.parent_guardian_name,
        s.designation_profession,
        s.organization_name,
        s.parent_email,
        s.parent_mobile,
        s.blood_group,
        s.medical_problems,
        s.important_medicines,
        s.language_read,
        s.language_write,
        s.language_speak,
        s.professional_societies,
        s.btech_marks_and_passing_year,
        s.placement,
        s.higher_studies,
        s.student_signature,
        s.counselor_1st_year,
        s.counselor_2nd_year,
        s.counselor_3rd_year,
        s.counselor_4th_year,
        s.mentor_name,
        s.mentor_email,
        s.hod_name,
        s.hod_email,
        s.counseling_note,
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
        CASE
          WHEN ps.percentage IS NOT NULL AND ps.percentage <> ''
          THEN ps.percentage
          ELSE NULL
        END AS percentage,
        s.grade
      FROM students s
      LEFT JOIN (
        SELECT p1.student_email, p1.semester_attendance, p1.cgpa, p1.percentage, p1.semester
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
      WHERE s.id = ? AND s.department = ?
      LIMIT 1
    `;

    db.query(sql, [id, dept], (err, result) => {
      if (err) {
        console.log("HOD student detail fetch error:", err);
        return res.status(500).json({ message: "Server error ❌" });
      }

      if (!result.length) {
        return res.status(404).json({ message: "Student not found ❌" });
      }

      return res.json(formatStudent(result[0]));
    });
  });
};

module.exports = {
  getHODStudents,
  getHODDashboard,
  getHODAlerts,
  getStudentById
};