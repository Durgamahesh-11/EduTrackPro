const db = require("../config/db");
const jwt = require("jsonwebtoken");

const loginUser = (req, res) => {
  const { email, password } = req.body;

  const finalEmail = (email || "").trim().toLowerCase();
  const finalPassword = (password || "").trim();

  if (!finalEmail || !finalPassword) {
    return res.status(400).json({
      message: "Email and password are required ❌"
    });
  }

  const sql = `
    SELECT id, name, email, password, role, department
    FROM users
    WHERE LOWER(email) = LOWER(?) AND password = ?
    LIMIT 1
  `;

  db.query(sql, [finalEmail, finalPassword], (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({
        message: "Server error ❌"
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials ❌"
      });
    }

    const user = result[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful ✅",
      token,
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        department: user.department || ""
      }
    });
  });
};

const registerStudent = (req, res) => {
  const {
    student_name,
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
    password
  } = req.body;

  const finalName = (student_name || "").trim();
  const finalEmail = (student_email || email || "").trim().toLowerCase();
  const finalRollNo = (roll_no || "").trim();
  const finalDepartment = (department || "").trim();
  const finalBranch = (branch || department || "").trim();
  const finalSection = (section || "").trim();
  const finalYear = (year || "2nd Year").trim();
  const finalPassword = (password || "").trim();
  const finalRegNo = (reg_no || finalRollNo).trim();
  const finalHtNo = (ht_no || finalRollNo).trim();

  const finalMentorName = (mentor_name || "Mentor CSE").trim();
  const finalMentorEmail = (mentor_email || "mentorcse@mlrit.ac.in")
    .trim()
    .toLowerCase();

  const finalHodName = (hod_name || "HOD CSE").trim();
  const finalHodEmail = (hod_email || "hodcse@mlrit.ac.in")
    .trim()
    .toLowerCase();

  if (
    !finalName ||
    !finalEmail ||
    !finalRollNo ||
    !finalDepartment ||
    !finalSection ||
    !finalPassword
  ) {
    return res.status(400).json({
      message: "Please fill all required fields ❌"
    });
  }

  if (!finalEmail.endsWith("@mlrit.ac.in")) {
    return res.status(400).json({
      message: "Use college email only ❌"
    });
  }

  const checkUserSql = `
    SELECT * FROM users
    WHERE LOWER(email) = LOWER(?)
    LIMIT 1
  `;

  const checkStudentSql = `
    SELECT * FROM students
    WHERE LOWER(student_email) = LOWER(?)
       OR LOWER(email) = LOWER(?)
       OR roll_no = ?
    LIMIT 1
  `;

  db.query(checkUserSql, [finalEmail], (userCheckErr, userCheckResult) => {
    if (userCheckErr) {
      console.log("CHECK USER ERROR:", userCheckErr);
      return res.status(500).json({
        message: "Server error ❌"
      });
    }

    if (userCheckResult.length > 0) {
      return res.status(400).json({
        message: "User already exists with this email ❌"
      });
    }

    db.query(
      checkStudentSql,
      [finalEmail, finalEmail, finalRollNo],
      (studentCheckErr, studentCheckResult) => {
        if (studentCheckErr) {
          console.log("CHECK STUDENT ERROR:", studentCheckErr);
          return res.status(500).json({
            message: "Server error ❌"
          });
        }

        if (studentCheckResult.length > 0) {
          return res.status(400).json({
            message: "Student already exists with this email or roll number ❌"
          });
        }

        const insertUserSql = `
          INSERT INTO users (name, email, password, role, department)
          VALUES (?, ?, ?, 'student', ?)
        `;

        db.query(
          insertUserSql,
          [finalName, finalEmail, finalPassword, finalDepartment],
          (insertUserErr, userInsertResult) => {
            if (insertUserErr) {
              console.log("INSERT USER ERROR:", insertUserErr);
              return res.status(500).json({
                message: "Failed to save login details in users table ❌"
              });
            }

            const userId = userInsertResult.insertId;

            const insertStudentSql = `
              INSERT INTO students
              (
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
                counseling_note,
                password
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
              insertStudentSql,
              [
                userId,
                finalName,
                finalName,
                finalRollNo,
                finalRegNo,
                finalHtNo,
                finalEmail,
                finalEmail,
                finalDepartment,
                finalBranch,
                finalSection,
                finalYear,
                finalMentorName,
                finalMentorEmail,
                finalHodName,
                finalHodEmail,
                0,
                0,
                "-",
                "",
                finalPassword
              ],
              (insertStudentErr) => {
                if (insertStudentErr) {
                  console.log("INSERT STUDENT ERROR:", insertStudentErr);

                  db.query(
                    "DELETE FROM users WHERE id = ?",
                    [userId],
                    (rollbackErr) => {
                      if (rollbackErr) {
                        console.log("ROLLBACK ERROR:", rollbackErr);
                      }
                    }
                  );

                  return res.status(500).json({
                    message: "Failed to save student details in students table ❌"
                  });
                }

                return res.status(201).json({
                  success: true,
                  message: "Student registered in both users and students tables ✅"
                });
              }
            );
          }
        );
      }
    );
  });
};

module.exports = {
  loginUser,
  registerStudent
};