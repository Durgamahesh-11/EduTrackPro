import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

function AdminCounseling() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    API.get("/admin/counseling")
      .then((res) => {
        setStudents(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log("Error fetching counseling reports:", err);
        setStudents([]);
      });
  }, []);

  const counselingReports = useMemo(() => {
    const merged = students.map((student, index) => {
      const attendance =
        student.attendance !== undefined &&
        student.attendance !== null &&
        student.attendance !== "" &&
        student.attendance !== "-" &&
        !isNaN(Number(student.attendance))
          ? Number(student.attendance)
          : 0;

      const percentage =
        student.percentage !== undefined &&
        student.percentage !== null &&
        student.percentage !== "" &&
        student.percentage !== "-" &&
        !isNaN(Number(student.percentage))
          ? Number(student.percentage)
          : 0;

      const cgpa =
        student.cgpa !== undefined &&
        student.cgpa !== null &&
        student.cgpa !== "" &&
        student.cgpa !== "-" &&
        !isNaN(Number(student.cgpa))
          ? Number(student.cgpa)
          : null;

      const remarks = [];

      if (attendance < 75) {
        remarks.push("Low attendance");
      }

      if (percentage > 0 && percentage < 50) {
        remarks.push("Performance needs improvement");
      }

      if (cgpa !== null && cgpa < 6) {
        remarks.push("CGPA is below expected level");
      }

      if (
        attendance >= 75 &&
        (percentage === 0 || percentage >= 50) &&
        (cgpa === null || cgpa >= 6)
      ) {
        remarks.push("Performance and attendance are satisfactory");
      }

      return {
        id:
          student.id ||
          student.roll_no ||
          student.reg_no ||
          student.student_email ||
          student.email ||
          index,
        studentName: student.student_name || student.studentName || student.name || "-",
        rollNo: student.roll_no || student.rollNo || student.reg_no || student.regNo || "-",
        department: student.department || student.dept || student.branch || "Unknown",
        section: student.section || "A",
        year: student.year || "-",
        mentorName: student.mentor_name || student.mentorName || "-",
        attendance,
        percentage,
        cgpa: cgpa !== null ? cgpa : "-",
        counselingNote: student.counseling_note || student.counselingNote || "No note added",
        remarks: remarks.join(", ")
      };
    });

    return merged.sort((a, b) => {
      const deptCompare = a.department.localeCompare(b.department);
      if (deptCompare !== 0) return deptCompare;

      const sectionCompare = String(a.section).localeCompare(String(b.section));
      if (sectionCompare !== 0) return sectionCompare;

      return a.studentName.localeCompare(b.studentName);
    });
  }, [students]);

  const summary = useMemo(() => {
    return {
      totalReports: counselingReports.length,
      lowAttendanceCases: counselingReports.filter((r) => r.attendance < 75).length,
      lowPerformanceCases: counselingReports.filter(
        (r) => r.percentage !== 0 && r.percentage < 50
      ).length,
      lowCGPACases: counselingReports.filter(
        (r) => r.cgpa !== "-" && Number(r.cgpa) < 6
      ).length
    };
  }, [counselingReports]);

  return (
    <div style={container}>
      <h2 style={title}>💬 Counseling Reports</h2>
      <p style={subtitle}>
        Department-wise and section-wise student observations based on attendance and performance
      </p>

      <div style={topCardsGrid}>
        <div style={topCard}>
          <h3 style={topValue}>{summary.totalReports}</h3>
          <p style={topLabel}>Total Reports</p>
        </div>

        <div style={dangerCard}>
          <h3 style={dangerValue}>{summary.lowAttendanceCases}</h3>
          <p style={topLabel}>Low Attendance Cases</p>
        </div>

        <div style={warningCard}>
          <h3 style={warningValue}>{summary.lowPerformanceCases}</h3>
          <p style={topLabel}>Low Performance Cases</p>
        </div>

        <div style={dangerCard}>
          <h3 style={dangerValue}>{summary.lowCGPACases}</h3>
          <p style={topLabel}>Low CGPA Cases</p>
        </div>
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>Student Counseling Summary</h3>

        {counselingReports.length === 0 ? (
          <p style={empty}>No counseling reports available ❌</p>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Department</th>
                  <th style={th}>Section</th>
                  <th style={th}>Student Name</th>
                  <th style={th}>Roll No</th>
                  <th style={th}>Mentor</th>
                  <th style={th}>Attendance</th>
                  <th style={th}>Performance</th>
                  <th style={th}>CGPA</th>
                  <th style={th}>Counseling Note</th>
                  <th style={th}>Observation</th>
                </tr>
              </thead>

              <tbody>
                {counselingReports.map((report) => (
                  <tr key={report.id}>
                    <td style={td}>{report.department}</td>
                    <td style={td}>{report.section}</td>
                    <td style={td}>{report.studentName}</td>
                    <td style={td}>{report.rollNo}</td>
                    <td style={td}>{report.mentorName}</td>
                    <td style={td}>{report.attendance}%</td>
                    <td style={td}>
                      {report.percentage ? `${report.percentage}%` : "-"}
                    </td>
                    <td style={td}>{report.cgpa}</td>
                    <td style={td}>{report.counselingNote}</td>
                    <td style={td}>{report.remarks}</td>
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

export default AdminCounseling;

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

const topCardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const topCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const dangerCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(127,29,29,0.95), rgba(69,10,10,0.95))",
  border: "1px solid rgba(248,113,113,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const warningCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(120,53,15,0.95), rgba(69,26,3,0.95))",
  border: "1px solid rgba(250,204,21,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const topValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: "0 0 8px 0"
};

const dangerValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#f87171",
  margin: "0 0 8px 0"
};

const warningValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#facc15",
  margin: "0 0 8px 0"
};

const topLabel = {
  color: "#cbd5e1",
  fontSize: "15px",
  margin: 0
};

const tableBox = {
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "18px",
  overflowX: "auto",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#38bdf8",
  fontSize: "20px",
  fontWeight: "700"
};

const empty = {
  color: "#f87171",
  fontSize: "15px"
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1300px"
};

const th = {
  padding: "14px 12px",
  textAlign: "left",
  background: "#1e293b",
  color: "#38bdf8",
  borderBottom: "1px solid #334155",
  fontSize: "14px",
  fontWeight: "700"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #1e293b",
  color: "#e2e8f0",
  verticalAlign: "top",
  fontSize: "14px"
};