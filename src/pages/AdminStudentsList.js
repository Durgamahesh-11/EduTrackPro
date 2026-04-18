import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../api/api";

function getValidNumber(value) {
  if (
    value === null ||
    value === undefined ||
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

function getGradeColor(grade) {
  if (grade === "O" || grade === "A+") return "#4ade80";
  if (grade === "A" || grade === "B+") return "#22d3ee";
  if (grade === "B" || grade === "C") return "#facc15";
  if (grade === "F") return "#f87171";
  return "#cbd5e1";
}

function AdminStudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching admin students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const stats = useMemo(() => {
    const total = students.length;
    const departments = new Set(
      students.map((s) => (s.department || "").trim()).filter(Boolean)
    ).size;

    const lowAttendance = students.filter((s) => {
      const attendance = getValidNumber(s.attendance);
      return attendance !== null && attendance < 75;
    }).length;

    const highPerformers = students.filter((s) => {
      const cgpa = getValidNumber(s.cgpa);
      return cgpa !== null && cgpa >= 8;
    }).length;

    return { total, departments, lowAttendance, highPerformers };
  }, [students]);

  const sortedStudents = useMemo(() => {
    return [...students]
      .map((student, index) => ({
        ...student,
        id: student.id || index,
        displayName: student.student_name || student.name || "-",
        displayRollNo: student.roll_no || student.reg_no || "-",
        department: student.department || "-",
        section: student.section || "-",
        year: student.year || "-",
        attendance: getValidNumber(student.attendance),
        cgpa: getValidNumber(student.cgpa),
        grade: student.grade || "-"
      }))
      .sort((a, b) => {
        const deptCompare = String(a.department).localeCompare(String(b.department));
        if (deptCompare !== 0) return deptCompare;

        const sectionCompare = String(a.section).localeCompare(String(b.section));
        if (sectionCompare !== 0) return sectionCompare;

        return String(a.displayName).localeCompare(String(b.displayName));
      });
  }, [students]);

  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(18);
    doc.text("Admin Students Report", 14, 16);

    doc.setFontSize(11);
    doc.text(`Total Students: ${stats.total}`, 14, 26);
    doc.text(`Departments: ${stats.departments}`, 14, 33);
    doc.text(`Low Attendance: ${stats.lowAttendance}`, 14, 40);
    doc.text(`High Performers: ${stats.highPerformers}`, 14, 47);

    const rows = sortedStudents.map((student, index) => [
      index + 1,
      student.displayName,
      student.displayRollNo,
      student.department,
      student.section,
      student.year,
      student.attendance !== null ? `${student.attendance}%` : "-",
      student.cgpa !== null ? student.cgpa : "-",
      student.grade || "-"
    ]);

    autoTable(doc, {
      startY: 55,
      head: [[
        "S.No",
        "Name",
        "Roll No",
        "Department",
        "Section",
        "Year",
        "Attendance",
        "CGPA",
        "Grade"
      ]],
      body: rows,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "middle"
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [56, 189, 248],
        fontStyle: "bold"
      },
      bodyStyles: {
        textColor: [15, 23, 42]
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249]
      }
    });

    doc.save("Admin_Students_Report.pdf");
  };

  return (
    <div style={container}>
      <div style={heroSection}>
        <div>
          <p style={eyebrow}>Admin Control Panel</p>
          <h2 style={title}>👥 Admin Students List</h2>
          <p style={subtitle}>All students across all departments</p>
        </div>

        <div style={actionButtons}>
          <button style={exportBtn} onClick={handleExportPDF}>
            Export PDF
          </button>

          <button style={refreshBtn} onClick={fetchStudents}>
            Refresh
          </button>
        </div>
      </div>

      <div style={cardsGrid}>
        <div style={card}>
          <div style={cardGlowBlue} />
          <h3 style={cardValue}>{stats.total}</h3>
          <p style={cardLabel}>Total Students</p>
        </div>

        <div style={card}>
          <div style={cardGlowCyan} />
          <h3 style={cardValue}>{stats.departments}</h3>
          <p style={cardLabel}>Departments</p>
        </div>

        <div style={dangerCard}>
          <div style={cardGlowRed} />
          <h3 style={dangerValue}>{stats.lowAttendance}</h3>
          <p style={cardLabel}>Low Attendance</p>
        </div>

        <div style={successCard}>
          <div style={cardGlowGreen} />
          <h3 style={successValue}>{stats.highPerformers}</h3>
          <p style={cardLabel}>High Performers</p>
        </div>
      </div>

      <div style={tableBox}>
        {loading ? (
          <p style={empty}>Loading students...</p>
        ) : sortedStudents.length === 0 ? (
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
                  <th style={th}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student) => (
                  <tr key={student.id} style={row}>
                    <td style={td}>{student.displayName}</td>
                    <td style={clickableTd}>
                      <button
                        type="button"
                        style={rollButton}
                        onClick={() => navigate(`/admin/student/${student.displayRollNo}`)}
                      >
                        {student.displayRollNo}
                      </button>
                    </td>
                    <td style={td}>
                      <span style={departmentBadge}>{student.department}</span>
                    </td>
                    <td style={td}>{student.section}</td>
                    <td style={td}>{student.year}</td>
                    <td style={td}>
                      <span
                        style={{
                          ...metricBadge,
                          color:
                            student.attendance !== null && student.attendance < 75
                              ? "#f87171"
                              : "#67e8f9"
                        }}
                      >
                        {student.attendance !== null ? `${student.attendance}%` : "-"}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ ...metricBadge, color: "#facc15" }}>
                        {student.cgpa !== null ? student.cgpa : "-"}
                      </span>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          ...gradeBadge,
                          color: getGradeColor(student.grade),
                          borderColor: `${getGradeColor(student.grade)}40`
                        }}
                      >
                        {student.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStudentsList;

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
  color: "#67e8f9",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

const title = {
  fontSize: "34px",
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

const actionButtons = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap"
};

const refreshBtn = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(90deg, #2563eb, #06b6d4)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(37,99,235,0.28)"
};

const exportBtn = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(124,58,237,0.28)"
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const cardBase = {
  position: "relative",
  overflow: "hidden",
  padding: "24px",
  borderRadius: "22px",
  backdropFilter: "blur(10px)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.32)"
};

const card = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(30,41,59,0.98), rgba(15,23,42,0.96))",
  border: "1px solid rgba(148, 163, 184, 0.16)"
};

const successCard = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(20,83,45,0.96), rgba(5,46,22,0.96))",
  border: "1px solid rgba(74,222,128,0.22)"
};

const dangerCard = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(127,29,29,0.96), rgba(69,10,10,0.96))",
  border: "1px solid rgba(248,113,113,0.22)"
};

const cardGlowBase = {
  position: "absolute",
  top: "-30px",
  right: "-30px",
  width: "100px",
  height: "100px",
  borderRadius: "999px",
  filter: "blur(20px)",
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

const cardGlowRed = {
  ...cardGlowBase,
  background: "#ef4444"
};

const cardGlowGreen = {
  ...cardGlowBase,
  background: "#22c55e"
};

const cardValue = {
  position: "relative",
  fontSize: "32px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: "0 0 10px 0"
};

const successValue = {
  ...cardValue,
  color: "#4ade80"
};

const dangerValue = {
  ...cardValue,
  color: "#f87171"
};

const cardLabel = {
  position: "relative",
  color: "#cbd5e1",
  fontSize: "14px",
  margin: 0,
  fontWeight: "500"
};

const tableBox = {
  background: "rgba(15,23,42,0.95)",
  padding: "22px",
  borderRadius: "22px",
  overflowX: "auto",
  border: "1px solid rgba(148,163,184,0.16)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
};

const empty = {
  color: "#f87171"
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
  textAlign: "left",
  background: "#1e293b",
  color: "#38bdf8",
  borderBottom: "1px solid #334155"
};

const row = {
  transition: "all 0.2s ease"
};

const td = {
  padding: "14px 12px",
  borderBottom: "1px solid #1e293b",
  color: "#e2e8f0"
};

const clickableTd = {
  ...td
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

const departmentBadge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "rgba(56,189,248,0.12)",
  color: "#67e8f9",
  border: "1px solid rgba(56,189,248,0.22)",
  fontWeight: "700",
  fontSize: "13px"
};

const metricBadge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "rgba(15,23,42,0.9)",
  border: "1px solid rgba(51,65,85,0.8)",
  fontWeight: "700",
  fontSize: "13px"
};

const gradeBadge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "rgba(15,23,42,0.9)",
  border: "1px solid",
  fontWeight: "800",
  fontSize: "13px",
  minWidth: "42px",
  textAlign: "center"
};