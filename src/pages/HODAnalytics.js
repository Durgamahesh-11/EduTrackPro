import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../api/api";

function HODAnalytics() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/hod/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching HOD analytics data:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
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

  const report = useMemo(() => {
    const toNumberOrNull = (value) => {
      if (
        value === "-" ||
        value === "" ||
        value === null ||
        value === undefined ||
        Number(value) === 0
      ) {
        return null;
      }
      const num = Number(value);
      return Number.isNaN(num) ? null : num;
    };

    const merged = students.map((student, index) => {
      const attendance = toNumberOrNull(student.attendance);
      const cgpa = toNumberOrNull(student.cgpa);

      return {
        id:
          student.id ||
          student.roll_no ||
          student.reg_no ||
          student.student_email ||
          student.email ||
          index,
        name: student.student_name || student.name || `Student ${index + 1}`,
        rollNo: student.roll_no || student.reg_no || "-",
        department: student.department || student.branch || "N/A",
        section: (student.section || "N/A").toUpperCase(),
        year: student.year || "-",
        attendance,
        cgpa,
        grade: getDisplayGrade(student.grade, cgpa),
        mentor_name: student.mentor_name || "-",
        hod_name: student.hod_name || "-",
        email: student.student_email || student.email || "-"
      };
    });

    const sortedStudents = [...merged].sort((a, b) => {
      const deptCompare = String(a.department).localeCompare(String(b.department));
      if (deptCompare !== 0) return deptCompare;

      const sectionCompare = String(a.section).localeCompare(String(b.section));
      if (sectionCompare !== 0) return sectionCompare;

      return String(a.name).localeCompare(String(b.name));
    });

    const validAttendance = sortedStudents.filter((s) => s.attendance !== null);
    const validCgpa = sortedStudents.filter((s) => s.cgpa !== null);

    return {
      totalStudents: sortedStudents.length,
      avgAttendance: validAttendance.length
        ? (
            validAttendance.reduce((sum, student) => sum + student.attendance, 0) /
            validAttendance.length
          ).toFixed(1)
        : "0.0",
      avgCGPA: validCgpa.length
        ? (
            validCgpa.reduce((sum, student) => sum + student.cgpa, 0) /
            validCgpa.length
          ).toFixed(2)
        : "0.00",
      lowAttendance: sortedStudents.filter(
        (s) => s.attendance !== null && s.attendance < 75
      ).length,
      highPerformers: sortedStudents.filter(
        (s) => s.cgpa !== null && s.cgpa >= 8
      ).length,
      students: sortedStudents
    };
  }, [students]);

  const getObservation = (student) => {
    const attendance = student.attendance;
    const cgpa = student.cgpa;

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

  const handleExportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(18);
    doc.text("HOD Reports & Analytics", 14, 16);

    doc.setFontSize(11);
    doc.text(`Total Students: ${report.totalStudents}`, 14, 26);
    doc.text(`Overall Avg Attendance: ${report.avgAttendance}%`, 14, 33);
    doc.text(`Overall Avg CGPA: ${report.avgCGPA}`, 14, 40);
    doc.text(`Low Attendance Cases: ${report.lowAttendance}`, 14, 47);
    doc.text(`High Performers: ${report.highPerformers}`, 14, 54);

    const tableRows = report.students.map((student, index) => [
      index + 1,
      student.name,
      student.rollNo,
      student.department,
      student.section,
      student.attendance !== null ? `${student.attendance}%` : "-",
      student.cgpa !== null ? student.cgpa : "-"
    ]);

    autoTable(doc, {
      startY: 62,
      head: [[
        "S.No",
        "Name",
        "Roll No",
        "Department",
        "Section",
        "Attendance",
        "CGPA"
      ]],
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59] }
    });

    doc.save("HOD_Analytics_Report.pdf");
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  return (
    <div style={container}>
      <div style={topRow}>
        <div>
          <p style={eyebrow}>HOD Analytics Overview</p>
          <h2 style={title}>📑 HOD Reports & Analytics</h2>
          <p style={subtitle}>Only your department students are shown here</p>
        </div>

        <div style={buttonGroup}>
          <button style={exportButton} onClick={handleExportPDF}>
            Export PDF
          </button>
        </div>
      </div>

      <div style={cardsGrid}>
        <div style={card}>
          <div style={cardGlowBlue} />
          <h3 style={value}>{report.totalStudents}</h3>
          <p style={label}>Total Students</p>
        </div>

        <div style={card}>
          <div style={cardGlowCyan} />
          <h3 style={value}>{report.avgAttendance}%</h3>
          <p style={label}>Overall Avg Attendance</p>
        </div>

        <div style={card}>
          <div style={cardGlowPurple} />
          <h3 style={value}>{report.avgCGPA}</h3>
          <p style={label}>Overall Avg CGPA</p>
        </div>

        <div style={dangerCard}>
          <div style={cardGlowRed} />
          <h3 style={dangerValue}>{report.lowAttendance}</h3>
          <p style={label}>Low Attendance Cases</p>
        </div>

        <div style={successCard}>
          <div style={cardGlowGreen} />
          <h3 style={successValue}>{report.highPerformers}</h3>
          <p style={label}>High Performers</p>
        </div>
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>Student Attendance & Performance Report</h3>

        {loading ? (
          <p style={emptyText}>Loading students...</p>
        ) : report.students.length === 0 ? (
          <p style={emptyText}>No students found ❌</p>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Roll No</th>
                  <th style={th}>Department</th>
                  <th style={th}>Section</th>
                  <th style={th}>Attendance</th>
                  <th style={th}>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {report.students.map((student) => (
                  <tr key={student.id} style={tableRow}>
                    <td style={td}>{student.name}</td>
                    <td style={clickableTd}>
                      <button
                        type="button"
                        style={rollButton}
                        onClick={() => setSelectedStudent(student)}
                      >
                        {student.rollNo}
                      </button>
                    </td>
                    <td style={td}>{student.department}</td>
                    <td style={td}>{student.section}</td>
                    <td style={td}>
                      {student.attendance !== null ? `${student.attendance}%` : "-"}
                    </td>
                    <td style={td}>
                      {student.cgpa !== null ? student.cgpa : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudent && (
        <div style={overlay} onClick={closeModal}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalGlowOne} />
            <div style={modalGlowTwo} />

            <div style={modalHeader}>
              <div>
                <p style={modalEyebrow}>Student Full Details</p>
                <h3 style={modalTitle}>{selectedStudent.name}</h3>
                <p style={modalSubTitle}>
                  {selectedStudent.department} • Section {selectedStudent.section}
                </p>
              </div>

              <button type="button" style={iconCloseBtn} onClick={closeModal}>
                ✕
              </button>
            </div>

            <div style={detailsGrid}>
              <div style={infoCard}>
                <h4 style={subSectionTitle}>Student Information</h4>
                <div style={infoList}>
                  <div style={infoRow}>
                    <span style={infoKey}>Name</span>
                    <span style={infoValue}>{selectedStudent.name}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Roll No</span>
                    <span style={infoValue}>{selectedStudent.rollNo}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Department</span>
                    <span style={infoValue}>{selectedStudent.department}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Section</span>
                    <span style={infoValue}>{selectedStudent.section}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Year</span>
                    <span style={infoValue}>{selectedStudent.year}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Email</span>
                    <span style={infoValue}>{selectedStudent.email}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>Mentor</span>
                    <span style={infoValue}>{selectedStudent.mentor_name}</span>
                  </div>
                  <div style={infoRow}>
                    <span style={infoKey}>HOD</span>
                    <span style={infoValue}>{selectedStudent.hod_name}</span>
                  </div>
                </div>
              </div>

              <div style={infoCard}>
                <h4 style={subSectionTitle}>Observation</h4>
                <div style={observationBox}>
                  <p style={observationText}>{getObservation(selectedStudent).attendanceText}</p>
                  <p style={observationText}>{getObservation(selectedStudent).performanceText}</p>
                  <p style={observationText}>{getObservation(selectedStudent).cgpaText}</p>
                </div>
              </div>
            </div>

            <div style={statsGrid}>
              <div style={statCard}>
                <p style={statLabel}>Attendance</p>
                <h4 style={statValue}>
                  {selectedStudent.attendance !== null
                    ? `${selectedStudent.attendance}%`
                    : "-"}
                </h4>
              </div>

              <div style={statCard}>
                <p style={statLabel}>CGPA</p>
                <h4 style={statValue}>
                  {selectedStudent.cgpa !== null ? selectedStudent.cgpa : "-"}
                </h4>
              </div>

              <div style={statCard}>
                <p style={statLabel}>Grade</p>
                <h4 style={statValue}>{selectedStudent.grade || "-"}</h4>
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

export default HODAnalytics;

const container = {
  padding: "26px",
  minHeight: "100vh",
  color: "#e2e8f0",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "16px",
  marginBottom: "26px"
};

const eyebrow = {
  margin: 0,
  color: "#67e8f9",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

const title = {
  fontSize: "32px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: "8px 0 0 0"
};

const subtitle = {
  marginTop: "10px",
  marginBottom: 0,
  color: "#94a3b8",
  fontSize: "15px"
};

const buttonGroup = {
  display: "flex",
  gap: "12px"
};

const exportButton = {
  padding: "12px 18px",
  background: "linear-gradient(90deg,#2563eb,#06b6d4)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 10px 25px rgba(37,99,235,0.3)"
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const baseCard = {
  position: "relative",
  overflow: "hidden",
  padding: "22px",
  borderRadius: "20px",
  border: "1px solid rgba(148,163,184,0.15)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  textAlign: "center"
};

const card = {
  ...baseCard,
  background: "linear-gradient(145deg,#0f172a,#020617)"
};

const dangerCard = {
  ...baseCard,
  background: "linear-gradient(145deg, rgba(127,29,29,0.96), rgba(69,10,10,0.96))",
  border: "1px solid rgba(248,113,113,0.22)"
};

const successCard = {
  ...baseCard,
  background: "linear-gradient(145deg, rgba(20,83,45,0.96), rgba(5,46,22,0.96))",
  border: "1px solid rgba(74,222,128,0.22)"
};

const cardGlowBase = {
  position: "absolute",
  top: "-28px",
  right: "-28px",
  width: "90px",
  height: "90px",
  borderRadius: "999px",
  filter: "blur(22px)",
  opacity: 0.18
};

const cardGlowBlue = {
  ...cardGlowBase,
  background: "#3b82f6"
};

const cardGlowCyan = {
  ...cardGlowBase,
  background: "#06b6d4"
};

const cardGlowPurple = {
  ...cardGlowBase,
  background: "#8b5cf6"
};

const cardGlowRed = {
  ...cardGlowBase,
  background: "#ef4444"
};

const cardGlowGreen = {
  ...cardGlowBase,
  background: "#22c55e"
};

const value = {
  position: "relative",
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: "0 0 8px 0"
};

const dangerValue = {
  ...value,
  color: "#f87171"
};

const successValue = {
  ...value,
  color: "#4ade80"
};

const label = {
  position: "relative",
  color: "#94a3b8",
  margin: 0
};

const tableBox = {
  background: "rgba(15,23,42,0.95)",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid rgba(148,163,184,0.15)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.3)"
};

const sectionTitle = {
  color: "#38bdf8",
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "20px",
  fontWeight: "800"
};

const emptyText = {
  color: "#cbd5e1"
};

const tableWrapper = {
  overflowX: "auto"
};

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

const clickableTd = {
  ...td
};

const tableRow = {
  transition: "all 0.2s ease"
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
  borderRadius: "20px",
  width: "750px",
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
  color: "#38bdf8",
  fontSize: "28px",
  margin: "8px 0 6px 0",
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

const detailsGrid = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "16px",
  marginBottom: "20px"
};

const infoCard = {
  background: "#111c34",
  padding: "18px",
  borderRadius: "14px",
  border: "1px solid #334155"
};

const subSectionTitle = {
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

const observationBox = {
  display: "grid",
  gap: "12px"
};

const observationText = {
  margin: 0,
  padding: "12px 14px",
  background: "rgba(15,23,42,0.8)",
  border: "1px solid rgba(51,65,85,0.8)",
  borderRadius: "12px",
  color: "#e2e8f0",
  lineHeight: "1.6"
};

const statsGrid = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "14px",
  marginTop: "20px"
};

const statCard = {
  background: "#0f172a",
  padding: "18px",
  borderRadius: "14px",
  textAlign: "center",
  border: "1px solid #334155"
};

const statValue = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#67e8f9",
  margin: "0 0 6px 0"
};

const statLabel = {
  color: "#94a3b8",
  margin: 0
};

const modalFooter = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "18px"
};

const closeBtn = {
  padding: "12px 20px",
  background: "linear-gradient(90deg,#ef4444,#dc2626)",
  border: "none",
  borderRadius: "12px",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
};