const db = require("../config/db");

const registerStudent = (req, res) => {
  const body = req.body || {};

  const {
    student_name,
    roll_no,
    email,
    password,
    department,
    year
  } = body;

  if (!student_name || !roll_no || !email || !password || !department || !year) {
    return res.status(400).json({
      success: false,
      message: "Fill all required fields ❌"
    });
  }

  const facultyMap = {
    CSE: ["CSE Mentor", "mentorcse@mlrit.ac.in", "CSE HOD", "hodcse@mlrit.ac.in"],
    ECE: ["ECE Mentor", "mentorece@mlrit.ac.in", "ECE HOD", "hodece@mlrit.ac.in"],
    EEE: ["EEE Mentor", "mentoreee@mlrit.ac.in", "EEE HOD", "hodeee@mlrit.ac.in"],
    MECH: ["MECH Mentor", "mentormech@mlrit.ac.in", "MECH HOD", "hodmech@mlrit.ac.in"],
    CIVIL: ["CIVIL Mentor", "mentorcivil@mlrit.ac.in", "CIVIL HOD", "hodcivil@mlrit.ac.in"],
    IT: ["IT Mentor", "mentorit@mlrit.ac.in", "IT HOD", "hodit@mlrit.ac.in"]
  };

  const [mentor_name, mentor_email, hod_name, hod_email] =
    facultyMap[department] || ["Not Assigned", "", "Not Assigned", ""];

  const checkSql = `
    SELECT * FROM students
    WHERE student_email = ? OR email = ? OR roll_no = ?
  `;

  db.query(checkSql, [email, email, roll_no], (err, result) => {
    if (err) {
      console.log("Register check error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error ❌"
      });
    }

    if (result.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Student already exists ❌"
      });
    }

    const insertSql = `
      INSERT INTO students (
        user_id,
        student_name,
        name,
        roll_no,
        reg_no,
        ht_no,
        email,
        student_email,
        department,
        branch,
        section,
        year,
        mentor_name,
        mentor_email,
        hod_name,
        hod_email,
        attendance,
        cgpa,
        grade,
        password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        null,
        student_name,
        student_name,
        roll_no,
        roll_no,
        roll_no,
        email,
        email,
        department,
        department,
        "A",
        year,
        mentor_name,
        mentor_email,
        hod_name,
        hod_email,
        0,
        0,
        "-",
        password
      ],
      (err2) => {
        if (err2) {
          console.log("Register insert error:", err2);
          return res.status(500).json({
            success: false,
            message: "Registration failed ❌"
          });
        }

        return res.json({
          success: true,
          message: "Registration successful ✅"
        });
      }
    );
  });
};

const getStudentProfile = (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT * FROM students
    WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
       OR LOWER(TRIM(email)) = LOWER(TRIM(?))
    LIMIT 1
  `;

  db.query(sql, [email, email], (err, result) => {
    if (err) {
      console.log("Get student profile error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student profile ❌"
      });
    }

    return res.json({
      success: true,
      data: result[0] || null
    });
  });
};

const updateStudentProfile = (req, res) => {
  const { email } = req.params;

  const {
    studentName,
    htNo,
    regNo,
    branch,
    yearOfAdmission,
    dateOfBirth,
    intermediateMarks,
    eamcetEcetRank,
    address,
    phoneR,
    parentGuardianName,
    designationProfession,
    organizationName,
    parentEmail,
    parentMobile,
    studentEmail,
    bloodGroup,
    medicalProblems,
    importantMedicines,
    languageRead,
    languageWrite,
    languageSpeak,
    professionalSocieties,
    btechMarksAndPassingYear,
    placement,
    higherStudies,
    studentSignature,
    counselor1stYear,
    counselor2ndYear,
    counselor3rdYear,
    counselor4thYear,
    section,
    department
  } = req.body || {};

  const updateSql = `
    UPDATE students
    SET
      student_name = ?,
      name = ?,
      roll_no = ?,
      reg_no = ?,
      ht_no = ?,
      branch = ?,
      department = ?,
      section = ?,
      year_of_admission = ?,
      date_of_birth = ?,
      intermediate_marks = ?,
      eamcet_ecet_rank = ?,
      address = ?,
      phone_r = ?,
      parent_guardian_name = ?,
      designation_profession = ?,
      organization_name = ?,
      parent_email = ?,
      parent_mobile = ?,
      student_email = ?,
      email = ?,
      blood_group = ?,
      medical_problems = ?,
      important_medicines = ?,
      language_read = ?,
      language_write = ?,
      language_speak = ?,
      professional_societies = ?,
      btech_marks_and_passing_year = ?,
      placement = ?,
      higher_studies = ?,
      student_signature = ?,
      counselor_1st_year = ?,
      counselor_2nd_year = ?,
      counselor_3rd_year = ?,
      counselor_4th_year = ?
    WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
       OR LOWER(TRIM(email)) = LOWER(TRIM(?))
  `;

  const values = [
    studentName || "",
    studentName || "",
    htNo || regNo || "",
    regNo || htNo || "",
    htNo || regNo || "",
    branch || "",
    department || "",
    section || "",
    yearOfAdmission || "",
    dateOfBirth || "",
    intermediateMarks || "",
    eamcetEcetRank || "",
    address || "",
    phoneR || "",
    parentGuardianName || "",
    designationProfession || "",
    organizationName || "",
    parentEmail || "",
    parentMobile || "",
    studentEmail || email || "",
    studentEmail || email || "",
    bloodGroup || "",
    medicalProblems || "",
    importantMedicines || "",
    languageRead || "",
    languageWrite || "",
    languageSpeak || "",
    professionalSocieties || "",
    btechMarksAndPassingYear || "",
    placement || "",
    higherStudies || "",
    studentSignature || "",
    counselor1stYear || "",
    counselor2ndYear || "",
    counselor3rdYear || "",
    counselor4thYear || "",
    email,
    email
  ];

  db.query(updateSql, values, (err, result) => {
    if (err) {
      console.log("Update student profile error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update student profile ❌",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found ❌"
      });
    }

    return res.json({
      success: true,
      message: "Student profile updated successfully ✅"
    });
  });
};

module.exports = {
  registerStudent,
  getStudentProfile,
  updateStudentProfile
};