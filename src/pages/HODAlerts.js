import { useEffect, useState } from "react";
import API from "../api/api";

function HODAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/hod/alerts");
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching HOD alerts:", error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  const getValidNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "-" ||
      Number(value) === 0
    ) {
      return null;
    }

    const num = Number(value);
    return Number.isNaN(num) ? null : num;
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

  const getStudentStatus = (student) => {
    const attendance = getValidNumber(student.attendance);
    const cgpa = getValidNumber(student.cgpa);

    if (attendance !== null && attendance < 75 && cgpa !== null && cgpa < 6) {
      return "⚠ Low Attendance & Performance";
    }
    if (attendance !== null && attendance < 75) {
      return "⚠ Low Attendance";
    }
    return "⚠ Low Performance";
  };

  const getObservation = (student) => {
    const attendance = getValidNumber(student.attendance);
    const cgpa = getValidNumber(student.cgpa);

    return {
      attendanceText:
        attendance !== null
          ? attendance < 75
            ? "⚠ Low attendance"
            : "✅ Good attendance"
          : "— Attendance not available",
      performanceText:
        cgpa !== null
          ? cgpa < 6
            ? "⚠ Performance needs improvement"
            : "✅ Performance is satisfactory"
          : "— Performance data not available",
      cgpaText:
        cgpa !== null
          ? cgpa < 6
            ? "⚠ CGPA is below expected level"
            : "✅ CGPA is satisfactory"
          : "— CGPA not available"
    };
  };

  return (
    <div style={container}>
      <div style={heroSection}>
        <div>
          <p style={eyebrow}>HOD Alert Center</p>
          <h2 style={title}>🚨 HOD Alerts</h2>
          <p style={subtitle}>Low attendance and low performance students</p>
        </div>

        <button style={refreshBtn} onClick={fetchAlerts}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={emptyBox}>
          <p style={emptyText}>Loading alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div style={emptyBox}>
          <p style={emptyText}>No alerts ✅</p>
        </div>
      ) : (
        <div style={alertsGrid}>
          {alerts.map((student, index) => {
            const attendance = getValidNumber(student.attendance);
            const cgpa = getValidNumber(student.cgpa);

            return (
              <div key={student.id || index} style={alertCard}>
                <div style={cardGlowRed} />
                <div style={cardGlowBlue} />

                <div style={topRow}>
                  <div>
                    <p style={smallTag}>At Risk Student</p>
                    <h3 style={studentName}>
                      {student.student_name || student.name || "Student"}
                    </h3>

                    <button
                      type="button"
                      style={rollButton}
                      onClick={() => setSelectedStudent(student)}
                    >
                      {student.roll_no || student.reg_no || "-"}
                    </button>
                  </div>

                  <div style={badge}>{getStudentStatus(student)}</div>
                </div>

                <div style={detailsRow}>
                  <div style={metricCard}>
                    <p style={metricLabel}>Attendance</p>
                    <h4 style={metricValueRed}>
                      {attendance !== null ? `${attendance}%` : "-"}
                    </h4>
                  </div>

                  <div style={metricCard}>
                    <p style={metricLabel}>CGPA</p>
                    <h4 style={metricValueYellow}>
                      {cgpa !== null ? cgpa : "-"}
                    </h4>
                  </div>

                  <div style={metricCard}>
                    <p style={metricLabel}>Section</p>
                    <h4 style={metricValueBlue}>{student.section || "-"}</h4>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedStudent && (
        <div style={overlay} onClick={closeModal}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalGlowOne} />
            <div style={modalGlowTwo} />

            <div style={modalHeader}>
              <div>
                <p style={modalEyebrow}>Alert Student Details</p>
                <h3 style={modalTitle}>
                  {selectedStudent.student_name || selectedStudent.name || "-"}
                </h3>
                <p style={modalSubTitle}>
                  {selectedStudent.department || "-"} • Section {selectedStudent.section || "-"}
                </p>
              </div>

              <button type="button" style={iconCloseBtn} onClick={closeModal}>
                ✕
              </button>
            </div>

            <div style={heroStats}>
              <div style={heroStatCard}>
                <p style={heroStatLabel}>Attendance</p>
                <h4 style={heroStatValueRed}>
                  {getValidNumber(selectedStudent.attendance) !== null
                    ? `${getValidNumber(selectedStudent.attendance)}%`
                    : "-"}
                </h4>
              </div>

              <div style={heroStatCard}>
                <p style={heroStatLabel}>CGPA</p>
                <h4 style={heroStatValueYellow}>
                  {getValidNumber(selectedStudent.cgpa) !== null
                    ? getValidNumber(selectedStudent.cgpa)
                    : "-"}
                </h4>
              </div>

              <div style={heroStatCard}>
                <p style={heroStatLabel}>Grade</p>
                <h4 style={heroStatValueBlue}>
                  {getDisplayGrade(
                    selectedStudent.grade,
                    getValidNumber(selectedStudent.cgpa)
                  )}
                </h4>
              </div>
            </div>

            <div style={detailsGrid}>
              <div style={infoCard}>
                <h4 style={sectionTitle}>Student Information</h4>
                <div style={infoList}>
                  <div style={infoRow}>
                    <span style={infoKey}>Name</span>
                    <span style={infoValue}>
                      {selectedStudent.student_name || selectedStudent.name || "-"}
                    </span>
                  </div>

                  <div style={infoRow}>
                    <span style={infoKey}>Roll No</span>
                    <span style={infoValue}>
                      {selectedStudent.roll_no || selectedStudent.reg_no || "-"}
                    </span>
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
                    <span style={infoKey}>Mentor</span>
                    <span style={infoValue}>{selectedStudent.mentor_name || "-"}</span>
                  </div>

                  <div style={infoRow}>
                    <span style={infoKey}>HOD</span>
                    <span style={infoValue}>{selectedStudent.hod_name || "-"}</span>
                  </div>

                  <div style={infoRow}>
                    <span style={infoKey}>Email</span>
                    <span style={infoValue}>
                      {selectedStudent.student_email || selectedStudent.email || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={infoCard}>
                <h4 style={sectionTitle}>Observation</h4>
                <div style={observationList}>
                  <div style={observationCard}>
                    {getObservation(selectedStudent).attendanceText}
                  </div>
                  <div style={observationCard}>
                    {getObservation(selectedStudent).performanceText}
                  </div>
                  <div style={observationCard}>
                    {getObservation(selectedStudent).cgpaText}
                  </div>
                  <div style={observationCard}>
                    <strong>Status:</strong> {getStudentStatus(selectedStudent)}
                  </div>
                </div>
              </div>
            </div>

            <div style={modalFooter}>
              <button onClick={closeModal} style={closeBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HODAlerts;

const container = {
  padding: "24px",
  minHeight: "100vh",
  color: "#e2e8f0",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)"
};

const heroSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "24px"
};

const eyebrow = {
  margin: 0,
  color: "#fda4af",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

const title = {
  color: "#38bdf8",
  fontSize: "32px",
  fontWeight: "800",
  margin: "8px 0 0 0"
};

const subtitle = {
  color: "#94a3b8",
  fontSize: "15px",
  marginTop: "8px",
  marginBottom: 0
};

const refreshBtn = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(90deg,#2563eb,#06b6d4)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(37,99,235,0.28)"
};

const emptyBox = {
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "20px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
};

const emptyText = {
  color: "#cbd5e1",
  fontSize: "15px",
  margin: 0
};

const alertsGrid = {
  display: "grid",
  gap: "18px"
};

const alertCard = {
  position: "relative",
  overflow: "hidden",
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "22px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const cardGlowBase = {
  position: "absolute",
  borderRadius: "999px",
  filter: "blur(24px)",
  opacity: 0.18
};

const cardGlowRed = {
  ...cardGlowBase,
  top: "-30px",
  right: "-30px",
  width: "120px",
  height: "120px",
  background: "#ef4444"
};

const cardGlowBlue = {
  ...cardGlowBase,
  bottom: "-30px",
  left: "-20px",
  width: "100px",
  height: "100px",
  background: "#06b6d4"
};

const topRow = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  flexWrap: "wrap",
  marginBottom: "18px"
};

const smallTag = {
  margin: "0 0 8px 0",
  fontSize: "12px",
  fontWeight: "700",
  color: "#fda4af",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const studentName = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#e2e8f0",
  margin: "0 0 10px 0"
};

const rollButton = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(56,189,248,0.35)",
  background: "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(6,182,212,0.16))",
  color: "#67e8f9",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 8px 20px rgba(0,0,0,0.22)"
};

const badge = {
  padding: "9px 14px",
  borderRadius: "999px",
  background: "rgba(239, 68, 68, 0.15)",
  color: "#fda4af",
  fontSize: "13px",
  fontWeight: "700",
  border: "1px solid rgba(239, 68, 68, 0.25)"
};

const detailsRow = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px"
};

const metricCard = {
  background: "linear-gradient(135deg, #1e293b, #0f172a)",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid #334155",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)"
};

const metricLabel = {
  color: "#94a3b8",
  fontSize: "13px",
  margin: "0 0 8px 0"
};

const metricValueRed = {
  color: "#f87171",
  fontSize: "24px",
  fontWeight: "800",
  margin: 0
};

const metricValueYellow = {
  color: "#facc15",
  fontSize: "24px",
  fontWeight: "800",
  margin: 0
};

const metricValueBlue = {
  color: "#38bdf8",
  fontSize: "24px",
  fontWeight: "800",
  margin: 0
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const modal = {
  position: "relative",
  background: "linear-gradient(145deg,#0f172a,#020617)",
  padding: "28px",
  borderRadius: "22px",
  width: "760px",
  maxWidth: "95%",
  maxHeight: "90vh",
  overflowY: "auto",
  color: "#e2e8f0",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
  border: "1px solid rgba(148,163,184,0.2)",
  overflow: "hidden"
};

const modalGlowOne = {
  position: "absolute",
  top: "-40px",
  right: "-40px",
  width: "160px",
  height: "160px",
  borderRadius: "999px",
  background: "rgba(239,68,68,0.14)",
  filter: "blur(24px)"
};

const modalGlowTwo = {
  position: "absolute",
  bottom: "-50px",
  left: "-40px",
  width: "180px",
  height: "180px",
  borderRadius: "999px",
  background: "rgba(56,189,248,0.14)",
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
  color: "#fda4af",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

const modalTitle = {
  color: "#f8fafc",
  margin: "8px 0 6px 0",
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

const heroStatValueRed = {
  margin: 0,
  color: "#f87171",
  fontSize: "26px",
  fontWeight: "800"
};

const heroStatValueYellow = {
  margin: 0,
  color: "#facc15",
  fontSize: "26px",
  fontWeight: "800"
};

const heroStatValueBlue = {
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
  gap: "16px",
  marginBottom: "20px"
};

const infoCard = {
  background: "#111c34",
  padding: "18px",
  borderRadius: "16px",
  lineHeight: "1.8",
  border: "1px solid #334155"
};

const sectionTitle = {
  color: "#38bdf8",
  marginTop: 0,
  marginBottom: "12px",
  fontSize: "18px",
  fontWeight: "700"
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

const observationList = {
  display: "grid",
  gap: "12px"
};

const observationCard = {
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(51,65,85,0.85)",
  color: "#e2e8f0",
  lineHeight: "1.6"
};

const modalFooter = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "8px"
};

const closeBtn = {
  background: "linear-gradient(90deg,#ef4444,#dc2626)",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700"
};