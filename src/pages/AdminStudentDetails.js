import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

function getValidNumber(value) {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "-" ||
    value === "null"
  ) {
    return null;
  }

  const cleaned = String(value).replace("%", "").trim();
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

function getYearFromSemester(semester) {
  const sem = Number(semester);
  if (sem === 1 || sem === 2) return "1st Year";
  if (sem === 3 || sem === 4) return "2nd Year";
  if (sem === 5 || sem === 6) return "3rd Year";
  if (sem === 7 || sem === 8) return "4th Year";
  return "Unknown";
}

function AdminStudentDetails() {
  const { regNo } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/admin/student/${regNo}`)
      .then((res) => {
        setStudentData(res.data || null);
      })
      .catch((err) => {
        console.log("Error fetching student details:", err);
        setStudentData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [regNo]);

  const normalizedStudent = useMemo(() => {
    if (!studentData) return null;

    const attendance = getValidNumber(studentData.attendance);
    const cgpa = getValidNumber(studentData.cgpa);
    const percentage = getValidNumber(studentData.percentage);

    return {
      id: studentData.id || "-",
      name: studentData.student_name || studentData.studentName || studentData.name || "-",
      regNo:
        studentData.reg_no ||
        studentData.roll_no ||
        studentData.regNo ||
        studentData.rollNo ||
        "-",
      department: studentData.department || studentData.dept || studentData.branch || "-",
      section: studentData.section || "-",
      year: studentData.year || getYearFromSemester(studentData.semester) || "-",
      attendance,
      cgpa,
      percentage,
      grade: studentData.grade || "-",
      email: studentData.student_email || studentData.studentEmail || studentData.email || "-",
      mentorName: studentData.mentor_name || studentData.mentorName || "-",
      hodName: studentData.hod_name || studentData.hodName || "-",
      counselingNote: studentData.counseling_note || studentData.counselingNote || "No note added"
    };
  }, [studentData]);

  const observation = useMemo(() => {
    if (!normalizedStudent) return [];

    const remarks = [];

    if (normalizedStudent.attendance !== null && normalizedStudent.attendance < 75) {
      remarks.push("⚠ Attendance is below the required level.");
    } else if (normalizedStudent.attendance !== null) {
      remarks.push("✅ Attendance is satisfactory.");
    }

    if (normalizedStudent.percentage !== null && normalizedStudent.percentage < 50) {
      remarks.push("⚠ Academic performance needs improvement.");
    } else if (normalizedStudent.percentage !== null) {
      remarks.push("✅ Academic percentage is satisfactory.");
    }

    if (normalizedStudent.cgpa !== null && normalizedStudent.cgpa < 6) {
      remarks.push("⚠ CGPA is below expected level.");
    } else if (normalizedStudent.cgpa !== null) {
      remarks.push("✅ CGPA is satisfactory.");
    }

    if (remarks.length === 0) {
      remarks.push("No detailed observation available.");
    }

    return remarks;
  }, [normalizedStudent]);

  if (loading) {
    return (
      <div style={container}>
        <div style={messageBox}>
          <p style={messageText}>Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!normalizedStudent) {
    return (
      <div style={container}>
        <div style={messageBox}>
          <p style={errorText}>Student not found ❌</p>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <h2 style={title}>👤 Student Overall Stats</h2>
      <p style={subtitle}>Complete details of selected student</p>

      <div style={cardsGrid}>
        <div style={card}>
          <h3 style={cardTitle}>Name</h3>
          <p style={cardValue}>{normalizedStudent.name}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Reg No</h3>
          <p style={cardValue}>{normalizedStudent.regNo}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Department</h3>
          <p style={cardValue}>{normalizedStudent.department}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Section</h3>
          <p style={cardValue}>{normalizedStudent.section}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Year</h3>
          <p style={cardValue}>{normalizedStudent.year}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Email</h3>
          <p style={smallCardValue}>{normalizedStudent.email}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Mentor</h3>
          <p style={cardValue}>{normalizedStudent.mentorName}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>HOD</h3>
          <p style={cardValue}>{normalizedStudent.hodName}</p>
        </div>
      </div>

      <div style={statsGrid}>
        <div style={statCard}>
          <h3 style={statTitle}>Attendance</h3>
          <p style={statValue}>
            {normalizedStudent.attendance !== null
              ? `${normalizedStudent.attendance}%`
              : "-"}
          </p>
        </div>

        <div style={statCard}>
          <h3 style={statTitle}>Performance</h3>
          <p style={statValue}>
            {normalizedStudent.percentage !== null
              ? `${normalizedStudent.percentage}%`
              : "-"}
          </p>
        </div>

        <div style={statCard}>
          <h3 style={statTitle}>CGPA</h3>
          <p style={statValue}>
            {normalizedStudent.cgpa !== null ? normalizedStudent.cgpa : "-"}
          </p>
        </div>

        <div style={statCard}>
          <h3 style={statTitle}>Grade</h3>
          <p style={statValue}>{normalizedStudent.grade}</p>
        </div>
      </div>

      <div style={detailsGrid}>
        <div style={panel}>
          <h3 style={sectionTitle}>💬 Counseling Note</h3>
          <p style={panelText}>{normalizedStudent.counselingNote}</p>
        </div>

        <div style={panel}>
          <h3 style={sectionTitle}>📌 Observation</h3>
          <div style={observationList}>
            {observation.map((item, index) => (
              <p key={index} style={panelText}>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStudentDetails;

const container = {
  padding: "24px",
  minHeight: "100vh",
  color: "#e2e8f0",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)"
};

const title = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8",
  marginBottom: "8px"
};

const subtitle = {
  color: "#94a3b8",
  marginBottom: "24px",
  fontSize: "15px"
};

const messageBox = {
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.16)"
};

const messageText = {
  color: "#cbd5e1",
  fontSize: "15px",
  margin: 0
};

const errorText = {
  color: "#f87171",
  fontSize: "15px",
  margin: 0
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const card = {
  background: "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
  border: "1px solid rgba(148, 163, 184, 0.18)"
};

const cardTitle = {
  color: "#94a3b8",
  fontSize: "14px",
  marginBottom: "8px",
  marginTop: 0,
  fontWeight: "600"
};

const cardValue = {
  color: "#e2e8f0",
  fontSize: "18px",
  fontWeight: "700",
  margin: 0
};

const smallCardValue = {
  color: "#e2e8f0",
  fontSize: "15px",
  fontWeight: "600",
  margin: 0,
  wordBreak: "break-word"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const statCard = {
  background: "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
  borderRadius: "18px",
  padding: "22px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
  border: "1px solid rgba(148, 163, 184, 0.18)"
};

const statTitle = {
  color: "#94a3b8",
  fontSize: "14px",
  marginBottom: "10px",
  marginTop: 0,
  fontWeight: "600"
};

const statValue = {
  color: "#38bdf8",
  fontSize: "28px",
  fontWeight: "800",
  margin: 0
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px"
};

const panel = {
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "16px",
  color: "#38bdf8",
  fontSize: "20px",
  fontWeight: "700"
};

const panelText = {
  color: "#cbd5e1",
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "0 0 10px 0"
};

const observationList = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};