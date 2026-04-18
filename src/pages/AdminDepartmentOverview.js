import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

function AdminDepartmentOverview() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    API.get("/admin/students")
      .then((res) => {
        setStudents(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log("Error fetching department overview:", err);
        setStudents([]);
      });
  }, []);

  const departmentStats = useMemo(() => {
    const mergedStudents = students.map((student, index) => {
      const attendance =
        student.attendance !== "-" &&
        student.attendance !== "" &&
        student.attendance !== null &&
        !isNaN(Number(student.attendance))
          ? Number(student.attendance)
          : null;

      const percentage =
        student.percentage !== "-" &&
        student.percentage !== "" &&
        student.percentage !== null &&
        !isNaN(Number(student.percentage))
          ? Number(student.percentage)
          : null;

      const cgpa =
        student.cgpa !== "-" &&
        student.cgpa !== "" &&
        student.cgpa !== null &&
        !isNaN(Number(student.cgpa))
          ? Number(student.cgpa)
          : null;

      return {
        id:
          student.id ||
          student.roll_no ||
          student.reg_no ||
          student.student_email ||
          student.email ||
          index,
        name: student.student_name || student.name || `Student ${index + 1}`,
        department: student.department || student.dept || student.branch || "Unknown",
        attendance,
        percentage,
        cgpa
      };
    });

    const grouped = {};

    mergedStudents.forEach((student) => {
      const dept = student.department;

      if (!grouped[dept]) {
        grouped[dept] = {
          totalStudents: 0,
          attendanceSum: 0,
          attendanceCount: 0,
          lowAttendance: 0,
          performanceSum: 0,
          performanceCount: 0,
          cgpaSum: 0,
          cgpaCount: 0,
          highPerformers: 0,
          avgPerformers: 0,
          lowPerformers: 0
        };
      }

      grouped[dept].totalStudents += 1;

      if (student.attendance !== null) {
        grouped[dept].attendanceSum += student.attendance;
        grouped[dept].attendanceCount += 1;

        if (student.attendance < 75) {
          grouped[dept].lowAttendance += 1;
        }
      }

      if (student.percentage !== null) {
        grouped[dept].performanceSum += student.percentage;
        grouped[dept].performanceCount += 1;
      }

      if (student.cgpa !== null) {
        grouped[dept].cgpaSum += student.cgpa;
        grouped[dept].cgpaCount += 1;

        if (student.cgpa >= 8) {
          grouped[dept].highPerformers += 1;
        } else if (student.cgpa >= 6) {
          grouped[dept].avgPerformers += 1;
        } else {
          grouped[dept].lowPerformers += 1;
        }
      }
    });

    return Object.entries(grouped)
      .map(([department, data]) => ({
        department,
        totalStudents: data.totalStudents,
        avgAttendance:
          data.attendanceCount > 0
            ? (data.attendanceSum / data.attendanceCount).toFixed(1)
            : "0.0",
        lowAttendance: data.lowAttendance,
        avgPerformance:
          data.performanceCount > 0
            ? (data.performanceSum / data.performanceCount).toFixed(1)
            : "0.0",
        avgCGPA:
          data.cgpaCount > 0
            ? (data.cgpaSum / data.cgpaCount).toFixed(2)
            : "0.00",
        highPerformers: data.highPerformers,
        avgPerformers: data.avgPerformers,
        lowPerformers: data.lowPerformers
      }))
      .sort((a, b) => a.department.localeCompare(b.department));
  }, [students]);

  const summary = useMemo(() => {
    return {
      totalDepartments: departmentStats.length,
      totalStudents: departmentStats.reduce((sum, dept) => sum + dept.totalStudents, 0),
      totalLowAttendance: departmentStats.reduce((sum, dept) => sum + dept.lowAttendance, 0),
      totalHighPerformers: departmentStats.reduce((sum, dept) => sum + dept.highPerformers, 0)
    };
  }, [departmentStats]);

  return (
    <div style={container}>
      <h2 style={title}>🏢 Department-wise Academic Overview</h2>
      <p style={subtitle}>
        Clear overview of attendance and performance for each department
      </p>

      <div style={cardsGridTop}>
        <div style={topCard}>
          <h3 style={topValue}>{summary.totalDepartments}</h3>
          <p style={topLabel}>Departments</p>
        </div>

        <div style={topCard}>
          <h3 style={topValue}>{summary.totalStudents}</h3>
          <p style={topLabel}>Total Students</p>
        </div>

        <div style={dangerCard}>
          <h3 style={dangerValue}>{summary.totalLowAttendance}</h3>
          <p style={topLabel}>Low Attendance Cases</p>
        </div>

        <div style={successCard}>
          <h3 style={successValue}>{summary.totalHighPerformers}</h3>
          <p style={topLabel}>High Performers</p>
        </div>
      </div>

      {departmentStats.length === 0 ? (
        <div style={emptyBox}>
          <p style={emptyText}>No department data available ❌</p>
        </div>
      ) : (
        <>
          <div style={tableBox}>
            <h3 style={sectionTitle}>Department Summary Table</h3>

            <div style={tableWrapper}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Department</th>
                    <th style={th}>Total Students</th>
                    <th style={th}>Avg Attendance</th>
                    <th style={th}>Low Attendance</th>
                    <th style={th}>Avg Performance</th>
                    <th style={th}>Avg CGPA</th>
                    <th style={th}>High Performers</th>
                    <th style={th}>Average Performers</th>
                    <th style={th}>Low Performers</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentStats.map((dept) => (
                    <tr key={dept.department}>
                      <td style={td}>{dept.department}</td>
                      <td style={td}>{dept.totalStudents}</td>
                      <td style={td}>{dept.avgAttendance}%</td>
                      <td
                        style={{
                          ...td,
                          color: Number(dept.lowAttendance) > 0 ? "#f87171" : "#e2e8f0",
                          fontWeight: "700"
                        }}
                      >
                        {dept.lowAttendance}
                      </td>
                      <td style={td}>{dept.avgPerformance}%</td>
                      <td style={td}>{dept.avgCGPA}</td>
                      <td style={{ ...td, color: "#22c55e", fontWeight: "700" }}>
                        {dept.highPerformers}
                      </td>
                      <td style={{ ...td, color: "#facc15", fontWeight: "700" }}>
                        {dept.avgPerformers}
                      </td>
                      <td style={{ ...td, color: "#f87171", fontWeight: "700" }}>
                        {dept.lowPerformers}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={cardsGrid}>
            {departmentStats.map((dept) => (
              <div key={dept.department} style={card}>
                <h3 style={cardTitle}>{dept.department}</h3>

                <div style={metricRow}>
                  <span style={metricLabel}>Total Students</span>
                  <span style={metricValue}>{dept.totalStudents}</span>
                </div>

                <div style={metricRow}>
                  <span style={metricLabel}>Average Attendance</span>
                  <span style={metricValue}>{dept.avgAttendance}%</span>
                </div>

                <div style={progressTrack}>
                  <div
                    style={{
                      ...progressFill,
                      width: `${Math.min(Number(dept.avgAttendance), 100)}%`,
                      background: "linear-gradient(90deg, #06b6d4, #3b82f6)"
                    }}
                  />
                </div>

                <div style={metricRow}>
                  <span style={metricLabel}>Average Performance</span>
                  <span style={metricValue}>{dept.avgPerformance}%</span>
                </div>

                <div style={progressTrack}>
                  <div
                    style={{
                      ...progressFill,
                      width: `${Math.min(Number(dept.avgPerformance), 100)}%`,
                      background: "linear-gradient(90deg, #22c55e, #16a34a)"
                    }}
                  />
                </div>

                <div style={metricRow}>
                  <span style={metricLabel}>Average CGPA</span>
                  <span style={metricValue}>{dept.avgCGPA}</span>
                </div>

                <div style={progressTrack}>
                  <div
                    style={{
                      ...progressFill,
                      width: `${Math.min(Number(dept.avgCGPA) * 10, 100)}%`,
                      background: "linear-gradient(90deg, #a855f7, #7c3aed)"
                    }}
                  />
                </div>

                <div style={splitGrid}>
                  <div style={smallStat}>
                    <p style={smallValueRed}>{dept.lowAttendance}</p>
                    <p style={smallLabel}>Low Attendance</p>
                  </div>

                  <div style={smallStat}>
                    <p style={smallValueGreen}>{dept.highPerformers}</p>
                    <p style={smallLabel}>High Performers</p>
                  </div>

                  <div style={smallStat}>
                    <p style={smallValueYellow}>{dept.avgPerformers}</p>
                    <p style={smallLabel}>Average</p>
                  </div>

                  <div style={smallStat}>
                    <p style={smallValueRed}>{dept.lowPerformers}</p>
                    <p style={smallLabel}>Low Performers</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDepartmentOverview;

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

const cardsGridTop = {
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

const successCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(20,83,45,0.95), rgba(5,46,22,0.95))",
  border: "1px solid rgba(74,222,128,0.25)",
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

const successValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#4ade80",
  margin: "0 0 8px 0"
};

const topLabel = {
  color: "#cbd5e1",
  fontSize: "15px",
  margin: 0
};

const emptyBox = {
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.16)"
};

const emptyText = {
  color: "#f87171",
  fontSize: "15px"
};

const tableBox = {
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "18px",
  overflowX: "auto",
  marginBottom: "24px",
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

const tableWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1100px"
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
  fontSize: "14px"
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px"
};

const card = {
  background: "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
  padding: "22px",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
  border: "1px solid rgba(148, 163, 184, 0.18)"
};

const cardTitle = {
  color: "#38bdf8",
  fontSize: "22px",
  marginBottom: "16px",
  marginTop: 0,
  fontWeight: "700"
};

const metricRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px"
};

const metricLabel = {
  color: "#cbd5e1",
  fontSize: "14px"
};

const metricValue = {
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "14px"
};

const progressTrack = {
  width: "100%",
  height: "10px",
  background: "#1e293b",
  borderRadius: "999px",
  overflow: "hidden",
  marginBottom: "14px"
};

const progressFill = {
  height: "100%",
  borderRadius: "999px"
};

const splitGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "12px",
  marginTop: "12px"
};

const smallStat = {
  background: "#111827",
  borderRadius: "12px",
  padding: "12px",
  textAlign: "center",
  border: "1px solid rgba(148, 163, 184, 0.08)"
};

const smallLabel = {
  color: "#94a3b8",
  fontSize: "13px",
  margin: 0
};

const smallValueGreen = {
  color: "#22c55e",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 6px 0"
};

const smallValueYellow = {
  color: "#facc15",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 6px 0"
};

const smallValueRed = {
  color: "#f87171",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 6px 0"
};