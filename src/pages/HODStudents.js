import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

function HODStudents() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/hod/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching HOD students:", error);
      setStudents([]);
    }
  };

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      return (
        (a.department || "").localeCompare(b.department || "") ||
        (a.section || "").localeCompare(b.section || "") ||
        (a.student_name || "").localeCompare(b.student_name || "")
      );
    });
  }, [students]);

  const getDisplayAttendance = (value) => {
    if (value === null || value === undefined || value === "" || Number(value) === 0) {
      return "-";
    }
    const num = Number(value);
    return Number.isNaN(num) ? "-" : `${num}%`;
  };

  const getDisplayCGPA = (value) => {
    if (value === null || value === undefined || value === "" || Number(value) === 0) {
      return "-";
    }
    const num = Number(value);
    return Number.isNaN(num) ? "-" : num;
  };

  const getDisplayGrade = (grade, cgpa) => {
    if (grade && grade !== "-") return grade;

    const num = Number(cgpa);
    if (Number.isNaN(num) || num <= 0) return "-";
    if (num >= 9.1 && num <= 10) return "O";
    if (num >= 8.1 && num <= 9.0) return "A+";
    if (num >= 7.1 && num <= 8.0) return "A";
    if (num >= 6.1 && num <= 7.0) return "B+";
    if (num >= 5.1 && num <= 6.0) return "B";
    if (num >= 4.1 && num <= 5.0) return "C";
    if (num > 0 && num <= 4.0) return "F";
    return "-";
  };

  return (
    <div style={container}>
      <h2 style={title}>👥 Department Students</h2>
      <p style={subtitle}>Only your department students are shown here</p>

      <div style={tableBox}>
        <h3 style={sectionTitle}>Student List</h3>

        {sortedStudents.length === 0 ? (
          <p style={empty}>No students found ❌</p>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Roll No</th>
                  <th style={th}>Department</th>
                  <th style={th}>Section</th>
                  <th style={th}>Year</th>
                  <th style={th}>Attendance</th>
                  <th style={th}>CGPA</th>
                </tr>
              </thead>

              <tbody>
                {sortedStudents.map((s, i) => (
                  <tr key={s.id || i}>
                    <td style={td}>{s.student_name || s.name || "-"}</td>

                    <td style={clickableTd}>
                      <button
                        type="button"
                        style={rollButton}
                        onClick={() => setSelectedStudent(s)}
                      >
                        {s.roll_no || s.reg_no || "-"}
                      </button>
                    </td>

                    <td style={td}>{s.department || "-"}</td>
                    <td style={td}>{s.section || "-"}</td>
                    <td style={td}>{s.year || "-"}</td>
                    <td style={td}>{getDisplayAttendance(s.attendance)}</td>
                    <td style={td}>{getDisplayCGPA(s.cgpa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudent && (
        <div style={overlay} onClick={() => setSelectedStudent(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalGlowOne} />
            <div style={modalGlowTwo} />

            <div style={modalHeader}>
              <div>
                <p style={modalEyebrow}>Student Profile</p>
                <h3 style={modalTitle}>
                  {selectedStudent.student_name || selectedStudent.name || "-"}
                </h3>
                <p style={modalSubTitle}>
                  {selectedStudent.department || "-"} • Section {selectedStudent.section || "-"}
                </p>
              </div>

              <button
                type="button"
                style={iconCloseBtn}
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            <div style={heroStats}>
              <div style={heroStatCard}>
                <p style={heroStatLabel}>Attendance</p>
                <h4 style={heroStatValue}>{getDisplayAttendance(selectedStudent.attendance)}</h4>
              </div>

              <div style={heroStatCard}>
                <p style={heroStatLabel}>CGPA</p>
                <h4 style={heroStatValue}>{getDisplayCGPA(selectedStudent.cgpa)}</h4>
              </div>

              <div style={heroStatCard}>
                <p style={heroStatLabel}>Grade</p>
                <h4 style={heroStatValue}>
                  {getDisplayGrade(selectedStudent.grade, selectedStudent.cgpa)}
                </h4>
              </div>
            </div>

            <div style={detailsGrid}>
              <div style={infoCard}>
                <h4 style={subSectionTitle}>Basic Information</h4>
                <div style={infoList}>
                  <div style={infoRow}>
                    <span style={infoKey}>Roll No</span>
                    <span style={infoValue}>{selectedStudent.roll_no || selectedStudent.reg_no || "-"}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Department</span>
                    <span style={infoValue}>{selectedStudent.department || "-"}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Section</span>
                    <span style={infoValue}>{selectedStudent.section || "-"}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Year</span>
                    <span style={infoValue}>{selectedStudent.year || "-"}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Email</span>
                    <span style={infoValue}>{selectedStudent.student_email || selectedStudent.email || "-"}</span>
                  </div>
                </div>
              </div>

              <div style={infoCard}>
                <h4 style={subSectionTitle}>Faculty Mapping</h4>
                <div style={infoList}>
                  <div style={infoRow}>
                    <span style={infoKey}>Mentor</span>
                    <span style={infoValue}>{selectedStudent.mentor_name || "-"}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>HOD</span>
                    <span style={infoValue}>{selectedStudent.hod_name || "-"}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Counseling Note</span>
                    <span style={infoValue}>{selectedStudent.counseling_note || "No note added"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={modalFooter}>
              <button
                type="button"
                style={closeBtn}
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HODStudents;

const container = {
  padding: "24px",
  minHeight: "100vh",
  color: "#e2e8f0",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)"
};

const title = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8"
};

const subtitle = {
  color: "#94a3b8",
  marginBottom: "24px"
};

const tableBox = {
  background: "rgba(15,23,42,0.92)",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(148,163,184,0.16)"
};

const sectionTitle = {
  color: "#38bdf8",
  marginBottom: "18px"
};

const empty = { color: "#f87171" };

const tableWrapper = { overflowX: "auto" };

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  padding: "14px",
  background: "#1e293b",
  color: "#38bdf8",
  textAlign: "left"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #1e293b"
};

const clickableTd = { ...td };

const rollButton = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(56,189,248,0.35)",
  background: "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(6,182,212,0.16))",
  color: "#67e8f9",
  cursor: "pointer",
  fontWeight: "700",
  textDecoration: "none",
  boxShadow: "0 8px 20px rgba(0,0,0,0.22)"
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.78)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const modal = {
  position: "relative",
  background: "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))",
  padding: "26px",
  borderRadius: "24px",
  width: "780px",
  maxWidth: "95%",
  color: "#e2e8f0",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
  overflow: "hidden"
};

const modalGlowOne = {
  position: "absolute",
  top: "-40px",
  right: "-40px",
  width: "160px",
  height: "160px",
  borderRadius: "999px",
  background: "rgba(56,189,248,0.16)",
  filter: "blur(24px)"
};

const modalGlowTwo = {
  position: "absolute",
  bottom: "-50px",
  left: "-40px",
  width: "180px",
  height: "180px",
  borderRadius: "999px",
  background: "rgba(139,92,246,0.14)",
  filter: "blur(28px)"
};

const modalHeader = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "22px"
};

const modalEyebrow = {
  margin: 0,
  color: "#67e8f9",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

const modalTitle = {
  margin: "8px 0 6px 0",
  color: "#f8fafc",
  fontSize: "28px",
  fontWeight: "800"
};

const modalSubTitle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "15px"
};

const iconCloseBtn = {
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(15,23,42,0.8)",
  color: "#cbd5e1",
  cursor: "pointer",
  fontWeight: "700"
};

const heroStats = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "14px",
  marginBottom: "22px"
};

const heroStatCard = {
  background: "linear-gradient(135deg, rgba(30,41,59,0.88), rgba(15,23,42,0.88))",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: "18px",
  padding: "18px"
};

const heroStatLabel = {
  margin: "0 0 8px 0",
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "700"
};

const heroStatValue = {
  margin: 0,
  color: "#67e8f9",
  fontSize: "26px",
  fontWeight: "800"
};

const detailsGrid = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px"
};

const infoCard = {
  background: "rgba(17,28,52,0.9)",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid rgba(51,65,85,0.9)"
};

const subSectionTitle = {
  color: "#38bdf8",
  marginTop: 0,
  marginBottom: "12px",
  fontSize: "17px"
};

const infoList = {
  display: "grid",
  gap: "10px"
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "flex-start",
  borderBottom: "1px solid rgba(51,65,85,0.6)",
  paddingBottom: "8px"
};

const infoKey = {
  color: "#94a3b8",
  fontSize: "14px",
  fontWeight: "600"
};

const infoValue = {
  color: "#e2e8f0",
  fontSize: "14px",
  fontWeight: "700",
  textAlign: "right"
};

const modalFooter = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "22px"
};

const closeBtn = {
  padding: "12px 22px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg, #2563eb, #06b6d4)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 10px 24px rgba(37,99,235,0.28)"
};