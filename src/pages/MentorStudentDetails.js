import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

function formatLabel(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isEmptyValue(value) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    value === "null"
  );
}

function displayValue(value) {
  if (isEmptyValue(value)) return "-";
  return String(value);
}

function getValidNumber(value) {
  if (isEmptyValue(value)) return null;
  const cleaned = String(value).replace("%", "").trim();
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

function getGradeFromCGPA(cgpa) {
  const value = getValidNumber(cgpa);

  if (value === null) return "-";
  if (value === 0) return "-";
  if (value >= 9.1 && value <= 10) return "O";
  if (value >= 8.1 && value <= 9.0) return "A+";
  if (value >= 7.1 && value <= 8.0) return "A";
  if (value >= 6.1 && value <= 7.0) return "B+";
  if (value >= 5.1 && value <= 6.0) return "B";
  if (value >= 4.1 && value <= 5.0) return "C";
  if (value > 0 && value <= 4.0) return "F";
  return "-";
}

function getPerformanceFromCGPA(cgpa) {
  const value = getValidNumber(cgpa);
  if (value === null) return null;
  return Number(((value / 10) * 100).toFixed(1));
}

function MentorStudentDetails() {
  const { regNo } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/mentor/student/${regNo}`);
      setStudent(res.data || null);
    } catch (error) {
      console.log("Error fetching mentor student details:", error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, [regNo]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const prepared = useMemo(() => {
    if (!student) return null;

    const full = { ...student };

    const attendance = getValidNumber(full.attendance);
    const cgpa = getValidNumber(full.cgpa);
    const performance = getPerformanceFromCGPA(cgpa);

    full.attendance = attendance !== null ? `${attendance}%` : "-";
    full.cgpa = cgpa !== null ? cgpa : "-";
    full.performance = performance !== null ? `${performance}%` : "-";
    full.grade =
      !isEmptyValue(full.grade) ? full.grade : getGradeFromCGPA(cgpa);

    const personalKeys = [
      "student_name",
      "name",
      "roll_no",
      "reg_no",
      "ht_no",
      "email",
      "student_email",
      "department",
      "branch",
      "section",
      "year",
      "year_of_admission",
      "date_of_birth",
      "gender",
      "blood_group",
      "phone_r",
      "mobile",
      "address",
      "parent_guardian_name",
      "parent_email",
      "parent_mobile",
      "designation_profession",
      "organization_name",
      "languages"
    ];

    const academicKeys = [
      "attendance",
      "cgpa",
      "grade",
      "performance",
      "intermediate_marks",
      "eamcet_ecet_rank",
      "backlogs",
      "no_of_backlogs",
      "sem11",
      "sem12",
      "sem21",
      "sem22",
      "sem31",
      "sem32",
      "sem41",
      "sem42"
    ];

    const mentorKeys = [
      "mentor_name",
      "mentor_email",
      "hod_name",
      "hod_email",
      "counseling_note",
      "medical_details",
      "medical_notes",
      "remarks",
      "suggestions"
    ];

    const activityKeys = [
      "certifications",
      "projects",
      "activities",
      "workshops",
      "seminars",
      "conferences",
      "industrial_visits",
      "competitive_exams",
      "gate_score",
      "gre_score"
    ];

    const pickFields = (keys) =>
      keys
        .filter((key) => Object.prototype.hasOwnProperty.call(full, key))
        .map((key) => ({
          key,
          label: formatLabel(key),
          value: displayValue(full[key])
        }))
        .filter((item) => item.value !== "-");

    const usedKeys = new Set([
      ...personalKeys,
      ...academicKeys,
      ...mentorKeys,
      ...activityKeys,
      "id",
      "password",
      "created_at",
      "updated_at"
    ]);

    const otherFields = Object.keys(full)
      .filter((key) => !usedKeys.has(key))
      .map((key) => ({
        key,
        label: formatLabel(key),
        value: displayValue(full[key])
      }))
      .filter((item) => item.value !== "-");

    return {
      personalFields: pickFields(personalKeys),
      academicFields: pickFields(academicKeys),
      mentorFields: pickFields(mentorKeys),
      activityFields: pickFields(activityKeys),
      otherFields,
      stats: {
        attendance: full.attendance,
        performance: full.performance,
        cgpa: displayValue(full.cgpa),
        grade: displayValue(full.grade)
      },
      titleName: full.student_name || full.name || "Student"
    };
  }, [student]);

  const renderFieldGrid = (fields) => {
    if (!fields || fields.length === 0) {
      return <p style={emptyText}>No data available</p>;
    }

    return (
      <div style={fieldGrid}>
        {fields.map((item) => (
          <div key={item.key} style={fieldCard}>
            <p style={fieldLabel}>{item.label}</p>
            <p style={fieldValue}>{item.value}</p>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={container}>
        <button style={backBtn} onClick={() => navigate("/students")}>
          ← Back
        </button>
        <h2 style={title}>Loading student details...</h2>
      </div>
    );
  }

  if (!prepared) {
    return (
      <div style={container}>
        <button style={backBtn} onClick={() => navigate("/students")}>
          ← Back
        </button>
        <h2 style={title}>Student Not Found</h2>
        <p style={subtitle}>This student is not assigned to you or does not exist.</p>
      </div>
    );
  }

  return (
    <div style={container}>
      <button style={backBtn} onClick={() => navigate("/students")}>
        ← Back to Students List
      </button>

      <div style={heroCard}>
        <h2 style={title}>📘 {prepared.titleName} - Full Student Profile</h2>
        <p style={subtitle}>
          Mentor can view all available student pages data here
        </p>
      </div>

      <div style={statsGrid}>
        <div style={statCard}>
          <h4 style={statValue}>{prepared.stats.attendance}</h4>
          <p style={statLabel}>Attendance</p>
        </div>
        <div style={statCard}>
          <h4 style={statValue}>{prepared.stats.performance}</h4>
          <p style={statLabel}>Performance</p>
        </div>
        <div style={statCard}>
          <h4 style={statValue}>{prepared.stats.cgpa}</h4>
          <p style={statLabel}>CGPA</p>
        </div>
        <div style={statCard}>
          <h4 style={statValue}>{prepared.stats.grade}</h4>
          <p style={statLabel}>Grade</p>
        </div>
      </div>

      <div style={sectionCard}>
        <h3 style={sectionTitle}>👤 Student Record</h3>
        {renderFieldGrid(prepared.personalFields)}
      </div>

      <div style={sectionCard}>
        <h3 style={sectionTitle}>📚 Academics / Performance</h3>
        {renderFieldGrid(prepared.academicFields)}
      </div>

      <div style={sectionCard}>
        <h3 style={sectionTitle}>💬 Mentoring / Counseling</h3>
        {renderFieldGrid(prepared.mentorFields)}
      </div>

      <div style={sectionCard}>
        <h3 style={sectionTitle}>🏆 Activities / Projects / Certifications</h3>
        {renderFieldGrid(prepared.activityFields)}
      </div>

      <div style={sectionCard}>
        <h3 style={sectionTitle}>🧾 Other Available Details</h3>
        {renderFieldGrid(prepared.otherFields)}
      </div>
    </div>
  );
}

export default MentorStudentDetails;

const container = {
  padding: "24px",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #020617, #071132, #0f172a)",
  color: "#e2e8f0"
};

const heroCard = {
  background: "rgba(15,23,42,0.92)",
  border: "1px solid rgba(148,163,184,0.14)",
  borderRadius: "22px",
  padding: "22px",
  marginBottom: "22px"
};

const title = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8",
  marginBottom: "8px"
};

const subtitle = {
  color: "#94a3b8",
  marginBottom: 0
};

const backBtn = {
  marginBottom: "16px",
  padding: "10px 14px",
  border: "none",
  borderRadius: "10px",
  background: "#1e293b",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "22px"
};

const statCard = {
  background: "linear-gradient(145deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))",
  padding: "20px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 14px 35px rgba(0,0,0,0.28)",
  textAlign: "center"
};

const statValue = {
  margin: "0 0 8px 0",
  fontSize: "28px",
  fontWeight: "800",
  color: "#38bdf8"
};

const statLabel = {
  margin: 0,
  color: "#cbd5e1",
  fontWeight: "600"
};

const sectionCard = {
  background: "rgba(15,23,42,0.92)",
  borderRadius: "22px",
  padding: "22px",
  marginBottom: "20px",
  border: "1px solid rgba(148,163,184,0.14)"
};

const sectionTitle = {
  color: "#38bdf8",
  marginTop: 0,
  marginBottom: "16px",
  fontSize: "20px",
  fontWeight: "800"
};

const fieldGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px"
};

const fieldCard = {
  background: "#111c34",
  border: "1px solid #334155",
  borderRadius: "14px",
  padding: "14px"
};

const fieldLabel = {
  margin: "0 0 8px 0",
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "700"
};

const fieldValue = {
  margin: 0,
  color: "#e2e8f0",
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "1.5",
  wordBreak: "break-word"
};

const emptyText = {
  color: "#94a3b8",
  margin: 0
};