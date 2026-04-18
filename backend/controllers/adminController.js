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

const formatStudent = (student) => {
  const attendanceValue =
    student.attendance !== null &&
    student.attendance !== undefined &&
    student.attendance !== "" &&
    !Number.isNaN(Number(student.attendance))
      ? Number(student.attendance)
      : 0;

  const cgpaValue =
    student.cgpa !== null &&
    student.cgpa !== undefined &&
    student.cgpa !== "" &&
    !Number.isNaN(Number(student.cgpa))
      ? Number(student.cgpa)
      : 0;

  return {
    ...student,
    attendance: attendanceValue,
    cgpa: cgpaValue,
    grade:
      student.grade && student.grade !== "-"
        ? student.grade
        : getGradeFromCGPA(cgpaValue)
  };
};

const studentBaseQuery = `
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
`;

const getAdminDashboard = (req, res) => {
  const sql = `${studentBaseQuery} ORDER BY s.department ASC, s.section ASC, s.student_name ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Admin dashboard error:", err);
      return res.status(500).json([]);
    }

    return res.json((result || []).map(formatStudent));
  });
};

const getAllStudents = (req, res) => {
  const sql = `${studentBaseQuery} ORDER BY s.department ASC, s.section ASC, s.student_name ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Get all students error:", err);
      return res.status(500).json([]);
    }

    return res.json((result || []).map(formatStudent));
  });
};

const getStudentByRegNo = (req, res) => {
  const { regNo } = req.params;

  const sql = `
    ${studentBaseQuery}
    WHERE
      LOWER(TRIM(s.reg_no)) = LOWER(TRIM(?))
      OR LOWER(TRIM(s.roll_no)) = LOWER(TRIM(?))
      OR LOWER(TRIM(s.ht_no)) = LOWER(TRIM(?))
    LIMIT 1
  `;

  db.query(sql, [regNo, regNo, regNo], (err, result) => {
    if (err) {
      console.log("Get student by reg no error:", err);
      return res.status(500).json(null);
    }

    if (!result.length) {
      return res.json(null);
    }

    return res.json(formatStudent(result[0]));
  });
};

const getDepartmentOverview = (req, res) => {
  const sql = `${studentBaseQuery} ORDER BY s.department ASC, s.section ASC, s.student_name ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Get department overview error:", err);
      return res.status(500).json([]);
    }

    return res.json((result || []).map(formatStudent));
  });
};

const getAttendanceReports = (req, res) => {
  const sql = `${studentBaseQuery} ORDER BY s.department ASC, s.section ASC, s.student_name ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Get attendance reports error:", err);
      return res.status(500).json([]);
    }

    return res.json((result || []).map(formatStudent));
  });
};

const getPerformanceReports = (req, res) => {
  const sql = `${studentBaseQuery} ORDER BY s.department ASC, s.section ASC, s.student_name ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Get performance reports error:", err);
      return res.status(500).json([]);
    }

    return res.json((result || []).map(formatStudent));
  });
};

const getCounselingReports = (req, res) => {
  const sql = `${studentBaseQuery} ORDER BY s.department ASC, s.section ASC, s.student_name ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Get counseling reports error:", err);
      return res.status(500).json([]);
    }

    return res.json((result || []).map(formatStudent));
  });
};

const getAllUsers = (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      email,
      role,
      department
    FROM users
    ORDER BY role ASC, department ASC, name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Get all users error:", err);
      return res.status(500).json([]);
    }

    return res.json(result || []);
  });
};

module.exports = {
  getAdminDashboard,
  getAllStudents,
  getStudentByRegNo,
  getDepartmentOverview,
  getAttendanceReports,
  getPerformanceReports,
  getCounselingReports,
  getAllUsers
};