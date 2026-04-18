import { useEffect, useMemo, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import API from "../api/api";

const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#22c55e", "#ef4444"];

function HODDashboard() {
  const [students, setStudents] = useState([]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await API.get("/hod/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching HOD dashboard students:", error);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const getValidAttendance = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "-" ||
      Number(value) === 0 ||
      Number.isNaN(Number(value))
    ) {
      return null;
    }
    return Number(value);
  };

  const getValidCGPA = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "-" ||
      Number(value) === 0 ||
      Number.isNaN(Number(value))
    ) {
      return null;
    }
    return Number(value);
  };

  const getGradeFromCGPA = (cgpa, grade) => {
    if (grade && grade !== "-") return grade;
    if (cgpa === null) return "-";
    if (cgpa >= 9.1 && cgpa <= 10) return "O";
    if (cgpa >= 8.1 && cgpa <= 9.0) return "A+";
    if (cgpa >= 7.1 && cgpa <= 8.0) return "A";
    if (cgpa >= 6.1 && cgpa <= 7.0) return "B+";
    if (cgpa >= 5.1 && cgpa <= 6.0) return "B";
    if (cgpa >= 4.1 && cgpa <= 5.0) return "C";
    if (cgpa > 0 && cgpa <= 4.0) return "F";
    return "-";
  };

  const dashboardData = useMemo(() => {
    const normalizedStudents = students.map((student, index) => {
      const attendance = getValidAttendance(student.attendance);
      const cgpa = getValidCGPA(student.cgpa);

      return {
        id:
          student.id ||
          student.roll_no ||
          student.reg_no ||
          student.student_email ||
          student.email ||
          index,
        name: student.student_name || student.name || "Student",
        rollNo: student.roll_no || student.reg_no || "-",
        department: student.department || "-",
        section: student.section || "-",
        year: student.year || "-",
        mentorName: student.mentor_name || "-",
        attendance,
        cgpa,
        grade: getGradeFromCGPA(cgpa, student.grade)
      };
    });

    const totalStudents = normalizedStudents.length;

    const validAttendanceStudents = normalizedStudents.filter(
      (student) => student.attendance !== null
    );

    const validCgpaStudents = normalizedStudents.filter(
      (student) => student.cgpa !== null
    );

    const avgAttendanceValue = validAttendanceStudents.length
      ? Number(
          (
            validAttendanceStudents.reduce(
              (sum, student) => sum + student.attendance,
              0
            ) / validAttendanceStudents.length
          ).toFixed(1)
        )
      : 0;

    const avgCGPAValue = validCgpaStudents.length
      ? Number(
          (
            validCgpaStudents.reduce((sum, student) => sum + student.cgpa, 0) /
            validCgpaStudents.length
          ).toFixed(2)
        )
      : 0;

    const lowAttendanceStudents = normalizedStudents
      .filter(
        (student) => student.attendance !== null && student.attendance < 75
      )
      .sort((a, b) => a.attendance - b.attendance);

    const lowPerformanceStudents = normalizedStudents
      .filter((student) => student.cgpa !== null && student.cgpa < 6)
      .sort((a, b) => a.cgpa - b.cgpa);

    const highPerformers = normalizedStudents.filter(
      (student) => student.cgpa !== null && student.cgpa >= 8
    ).length;

    const avgPerformers = normalizedStudents.filter(
      (student) =>
        student.cgpa !== null && student.cgpa >= 6 && student.cgpa < 8
    ).length;

    const lowPerformers = lowPerformanceStudents.length;
    const lowAttendance = lowAttendanceStudents.length;

    const attendancePieData = [
      { name: "Attendance", value: avgAttendanceValue },
      { name: "Remaining", value: Math.max(0, 100 - avgAttendanceValue) }
    ];

    const cgpaPieData = [
      { name: "CGPA", value: avgCGPAValue },
      { name: "Remaining", value: Math.max(0, 10 - avgCGPAValue) }
    ];

    const performancePieData = [
      { name: "High", value: highPerformers },
      { name: "Average", value: avgPerformers },
      { name: "Low", value: lowPerformers }
    ].filter((item) => item.value > 0);

    return {
      totalStudents,
      avgAttendance: avgAttendanceValue.toFixed(1),
      avgCGPA: avgCGPAValue.toFixed(2),
      highPerformers,
      avgPerformers,
      lowPerformers,
      lowAttendance,
      attendancePieData,
      cgpaPieData,
      performancePieData,
      lowAttendanceStudents,
      lowPerformanceStudents
    };
  }, [students]);

  return (
    <div style={container}>
      <h2 style={title}>🎓 HOD Dashboard</h2>
      <p style={subtitle}>
        Monitor attendance, CGPA, and performance of only your department students
      </p>

      <div style={cardsGrid}>
        <div style={card}>
          <div style={cardGlowBlue} />
          <h3 style={value}>{dashboardData.totalStudents}</h3>
          <p style={label}>Total Students</p>
        </div>

        <div style={card}>
          <div style={cardGlowCyan} />
          <h3 style={value}>{dashboardData.avgAttendance}%</h3>
          <p style={label}>Overall Avg Attendance</p>
        </div>

        <div style={card}>
          <div style={cardGlowPurple} />
          <h3 style={value}>{dashboardData.avgCGPA}</h3>
          <p style={label}>Overall Avg CGPA</p>
        </div>

        <div style={dangerCard}>
          <div style={cardGlowRed} />
          <h3 style={dangerValue}>{dashboardData.lowAttendance}</h3>
          <p style={label}>Low Attendance Students</p>
        </div>

        <div style={successCard}>
          <div style={cardGlowGreen} />
          <h3 style={successValue}>{dashboardData.highPerformers}</h3>
          <p style={label}>High Performers (CGPA ≥ 8)</p>
        </div>

        <div style={warningCard}>
          <div style={cardGlowYellow} />
          <h3 style={warningValue}>{dashboardData.avgPerformers}</h3>
          <p style={label}>Average Performers (6 - 7.99)</p>
        </div>

        <div style={dangerCard}>
          <div style={cardGlowRed} />
          <h3 style={dangerValue}>{dashboardData.lowPerformers}</h3>
          <p style={label}>Low Performance Students</p>
        </div>
      </div>

      <div style={chartsGrid}>
        <div style={chartBox}>
          <h3 style={sectionTitle}>🥧 Overall Attendance</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={dashboardData.attendancePieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={110}
                paddingAngle={3}
                label={({ name, value }) =>
                  name === "Attendance" ? `${value}%` : ""
                }
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#1e293b" />
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={chartBox}>
          <h3 style={sectionTitle}>🥧 Overall CGPA</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={dashboardData.cgpaPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={110}
                paddingAngle={3}
                label={({ name, value }) =>
                  name === "CGPA" ? `${value}` : ""
                }
              >
                <Cell fill="#06b6d4" />
                <Cell fill="#1e293b" />
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={chartBox}>
          <h3 style={sectionTitle}>🥧 Performance Distribution</h3>
          {dashboardData.performancePieData.length === 0 ? (
            <p style={emptyText}>No performance data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={dashboardData.performancePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {dashboardData.performancePieData.map((entry, index) => (
                    <Cell
                      key={`perf-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={listsGrid}>
        <div style={tableBox}>
          <h3 style={sectionTitle}>🚨 Low Attendance Students</h3>
          {dashboardData.lowAttendanceStudents.length === 0 ? (
            <p style={emptyText}>No low attendance students ✅</p>
          ) : (
            <div style={tableWrapper}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>Roll No</th>
                    <th style={th}>Section</th>
                    <th style={th}>Attendance</th>
                    <th style={th}>Mentor</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.lowAttendanceStudents.map((student) => (
                    <tr key={student.id}>
                      <td style={td}>{student.name}</td>
                      <td style={td}>{student.rollNo}</td>
                      <td style={td}>{student.section}</td>
                      <td style={{ ...td, color: "#f87171", fontWeight: "700" }}>
                        {student.attendance}%
                      </td>
                      <td style={td}>{student.mentorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={tableBox}>
          <h3 style={sectionTitle}>📉 Low Performance Students</h3>
          {dashboardData.lowPerformanceStudents.length === 0 ? (
            <p style={emptyText}>No low performance students ✅</p>
          ) : (
            <div style={tableWrapper}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>Roll No</th>
                    <th style={th}>Section</th>
                    <th style={th}>CGPA</th>
                    <th style={th}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.lowPerformanceStudents.map((student) => (
                    <tr key={student.id}>
                      <td style={td}>{student.name}</td>
                      <td style={td}>{student.rollNo}</td>
                      <td style={td}>{student.section}</td>
                      <td style={{ ...td, color: "#facc15", fontWeight: "700" }}>
                        {student.cgpa}
                      </td>
                      <td style={{ ...td, color: "#f87171", fontWeight: "700" }}>
                        {student.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HODDashboard;

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
  margin: 0
};

const subtitle = {
  marginTop: "8px",
  marginBottom: "24px",
  color: "#94a3b8",
  fontSize: "15px"
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "24px",
  marginTop: "24px",
  marginBottom: "24px"
};

const listsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
  gap: "24px"
};

const cardBase = {
  padding: "24px",
  borderRadius: "20px",
  position: "relative",
  overflow: "hidden",
  backdropFilter: "blur(10px)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.32)"
};

const card = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(30,41,59,0.98), rgba(15,23,42,0.96))",
  border: "1px solid rgba(148, 163, 184, 0.16)"
};

const dangerCard = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(127,29,29,0.96), rgba(69,10,10,0.96))",
  border: "1px solid rgba(248,113,113,0.22)"
};

const successCard = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(20,83,45,0.96), rgba(5,46,22,0.96))",
  border: "1px solid rgba(74,222,128,0.22)"
};

const warningCard = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(120,53,15,0.96), rgba(69,26,3,0.96))",
  border: "1px solid rgba(250,204,21,0.22)"
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

const cardGlowYellow = {
  ...cardGlowBase,
  background: "#facc15"
};

const value = {
  position: "relative",
  fontSize: "32px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: "0 0 10px 0",
  letterSpacing: "0.3px"
};

const dangerValue = {
  position: "relative",
  fontSize: "32px",
  fontWeight: "800",
  color: "#f87171",
  margin: "0 0 10px 0",
  letterSpacing: "0.3px"
};

const successValue = {
  position: "relative",
  fontSize: "32px",
  fontWeight: "800",
  color: "#4ade80",
  margin: "0 0 10px 0",
  letterSpacing: "0.3px"
};

const warningValue = {
  position: "relative",
  fontSize: "32px",
  fontWeight: "800",
  color: "#facc15",
  margin: "0 0 10px 0",
  letterSpacing: "0.3px"
};

const label = {
  position: "relative",
  color: "#cbd5e1",
  fontSize: "14px",
  margin: 0,
  fontWeight: "500",
  lineHeight: "1.5"
};

const chartBox = {
  background: "rgba(15,23,42,0.92)",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(148,163,184,0.16)"
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

const emptyText = {
  color: "#94a3b8"
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