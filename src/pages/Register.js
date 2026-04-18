import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Register() {
  const navigate = useNavigate();

  const departmentFacultyMap = {
    CSE: {
      mentorName: "CSE Mentor",
      mentorEmail: "mentorcse@mlrit.ac.in",
      hodName: "CSE HOD",
      hodEmail: "hodcse@mlrit.ac.in"
    },
    ECE: {
      mentorName: "ECE Mentor",
      mentorEmail: "mentorece@mlrit.ac.in",
      hodName: "ECE HOD",
      hodEmail: "hodece@mlrit.ac.in"
    },
    EEE: {
      mentorName: "EEE Mentor",
      mentorEmail: "mentoreee@mlrit.ac.in",
      hodName: "EEE HOD",
      hodEmail: "hodeee@mlrit.ac.in"
    },
    MECH: {
      mentorName: "MECH Mentor",
      mentorEmail: "mentormech@mlrit.ac.in",
      hodName: "MECH HOD",
      hodEmail: "hodmech@mlrit.ac.in"
    },
    CIVIL: {
      mentorName: "CIVIL Mentor",
      mentorEmail: "mentorcivil@mlrit.ac.in",
      hodName: "CIVIL HOD",
      hodEmail: "hodcivil@mlrit.ac.in"
    },
    IT: {
      mentorName: "IT Mentor",
      mentorEmail: "mentorit@mlrit.ac.in",
      hodName: "IT HOD",
      hodEmail: "hodit@mlrit.ac.in"
    }
  };

  const [form, setForm] = useState({
    studentName: "",
    rollNo: "",
    email: "",
    password: "",
    department: "",
    year: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const studentName = form.studentName.trim();
    const rollNo = form.rollNo.trim();
    const department = form.department.trim();
    const year = form.year.trim();

    if (!studentName || !rollNo || !email || !password || !department || !year) {
      alert("Please fill all required fields ❌");
      return;
    }

    if (!email.endsWith("@mlrit.ac.in")) {
      alert("Use college email only ❌");
      return;
    }

    const assignedFaculty = departmentFacultyMap[department] || {
      mentorName: "Not Assigned",
      mentorEmail: "",
      hodName: "Not Assigned",
      hodEmail: ""
    };

    const payload = {
      student_name: studentName,
      roll_no: rollNo,
      reg_no: rollNo,
      ht_no: rollNo,
      email: email,
      student_email: email,
      password: password,
      department: department,
      branch: department,
      section: "A",
      year: year,
      mentor_name: assignedFaculty.mentorName,
      mentor_email: assignedFaculty.mentorEmail,
      hod_name: assignedFaculty.hodName,
      hod_email: assignedFaculty.hodEmail
    };

    try {
      setLoading(true);

      // ✅ FIXED: register goes to auth route
      const res = await API.post("/auth/register", payload);

      alert(res.data.message || "Registration successful ✅");
      navigate("/login");
    } catch (error) {
      console.log("Register error:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Registration failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={box}>
        <h2 style={title}>Student Registration</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={form.studentName}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            type="text"
            name="rollNo"
            placeholder="Roll Number / Registration Number"
            value={form.rollNo}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={input}
            required
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            style={input}
            required
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="IT">IT</option>
          </select>

          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            style={input}
            required
          >
            <option value="">Select Current Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          {form.department && (
            <div style={infoBox}>
              <p style={infoText}>
                <strong>Assigned Mentor:</strong>{" "}
                {departmentFacultyMap[form.department]?.mentorName}
              </p>
              <p style={infoText}>
                <strong>Assigned HOD:</strong>{" "}
                {departmentFacultyMap[form.department]?.hodName}
              </p>
            </div>
          )}

          <button type="submit" style={button} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={text}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e3a8a)"
};

const box = {
  width: "380px",
  padding: "30px",
  borderRadius: "16px",
  background: "#0f172a",
  boxShadow: "0 8px 30px rgba(0,0,0,0.4)"
};

const title = {
  color: "#38bdf8",
  marginBottom: "20px",
  textAlign: "center"
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#fff",
  boxSizing: "border-box"
};

const button = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const text = {
  color: "#cbd5e1",
  marginTop: "15px",
  textAlign: "center"
};

const infoBox = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "10px",
  padding: "12px",
  marginBottom: "15px"
};

const infoText = {
  color: "#cbd5e1",
  margin: "4px 0",
  fontSize: "14px"
};