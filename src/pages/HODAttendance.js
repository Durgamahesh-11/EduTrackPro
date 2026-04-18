import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import API from "../api/api";

const SECTION_ORDER = ["A", "B", "C", "D", "E", "F", "G"];
const PIE_COLORS = ["#22c55e", "#facc15", "#ef4444"];

function HODAttendance() {
  const [students, setStudents] = useState([]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await API.get("/hod/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching attendance:", error);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const attendanceStats = useMemo(() => {
    const merged = students.map((student, index) => {
      const attendance =
        student.attendance !== "-" &&
        student.attendance !== "" &&
        student.attendance !== null &&
        Number(student.attendance) > 0 &&
        !Number.isNaN(Number(student.attendance))
          ? Number(student.attendance)
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
        rollNo: student.roll_no || student.reg_no || "-",
        section: (student.section || "N/A").toUpperCase(),
        attendance
      };
    });

    const sectionMap = {};
    SECTION_ORDER.forEach((section) => {
      sectionMap[section] = {
        name: section,
        students: 0,
        attendanceValues: []
      };
    });

    merged.forEach((student) => {
      const sec = student.section;

      if (!sectionMap[sec]) {
        sectionMap[sec] = {
          name: sec,
          students: 0,
          attendanceValues: []
        };
      }

      sectionMap[sec].students += 1;

      if (student.attendance !== null) {
        sectionMap[sec].attendanceValues.push(student.attendance);
      }
    });

    const sectionData = Object.values(sectionMap).map((section) => ({
      name: section.name,
      students: section.students,
      avgAttendance: section.attendanceValues.length
        ? Number(
            (
              section.attendanceValues.reduce((a, b) => a + b, 0) /
              section.attendanceValues.length
            ).toFixed(1)
          )
        : 0
    }));

    const validAttendance = merged
      .map((student) => student.attendance)
      .filter((value) => value !== null);

    const overallAvgAttendance = validAttendance.length
      ? (
          validAttendance.reduce((a, b) => a + b, 0) / validAttendance.length
        ).toFixed(1)
      : "0.0";

    const excellentAttendance = merged.filter(
      (student) => student.attendance !== null && student.attendance >= 85
    ).length;

    const averageAttendance = merged.filter(
      (student) =>
        student.attendance !== null &&
        student.attendance >= 75 &&
        student.attendance < 85
    ).length;

    const lowAttendance = merged.filter(
      (student) => student.attendance !== null && student.attendance < 75
    ).length;

    const lowAttendanceStudents = merged
      .filter((student) => student.attendance !== null && student.attendance < 75)
      .sort((a, b) => a.attendance - b.attendance);

    const attendanceDistribution = [
      { name: "Excellent", value: excellentAttendance },
      { name: "Average", value: averageAttendance },
      { name: "Low", value: lowAttendance }
    ].filter((item) => item.value > 0);

    return {
      totalStudents: merged.length,
      overallAvgAttendance,
      excellentAttendance,
      averageAttendance,
      lowAttendance,
      sectionData,
      lowAttendanceStudents,
      attendanceDistribution
    };
  }, [students]);

  return (
    <div style={container}>
      <div style={heroSection}>
        <div>
          <p style={eyebrow}>HOD Attendance Overview</p>
          <h2 style={title}>📊 Section Attendance Dashboard</h2>
          <p style={subtitle}>Premium section-wise attendance insights for your department</p>
        </div>

        <button style={refreshBtn} onClick={fetchStudents}>
          Refresh
        </button>
      </div>

      <div style={cardsGrid}>
        <div style={card}>
          <div style={cardGlowBlue} />
          <h3 style={value}>{attendanceStats.totalStudents}</h3>
          <p style={label}>Total Students</p>
        </div>

        <div style={card}>
          <div style={cardGlowCyan} />
          <h3 style={value}>{attendanceStats.overallAvgAttendance}%</h3>
          <p style={label}>Overall Avg Attendance</p>
        </div>

        <div style={successCard}>
          <div style={cardGlowGreen} />
          <h3 style={successValue}>{attendanceStats.excellentAttendance}</h3>
          <p style={label}>Excellent Attendance</p>
        </div>

        <div style={warningCard}>
          <div style={cardGlowYellow} />
          <h3 style={warningValue}>{attendanceStats.averageAttendance}</h3>
          <p style={label}>Average Attendance</p>
        </div>

        <div style={dangerCard}>
          <div style={cardGlowRed} />
          <h3 style={dangerValue}>{attendanceStats.lowAttendance}</h3>
          <p style={label}>Low Attendance</p>
        </div>
      </div>

      <div style={chartsGrid}>
        <div style={chartCardLarge}>
          <div style={chartHeader}>
            <div>
              <h3 style={sectionTitle}>Section-wise Attendance</h3>
              <p style={sectionSubText}>Average attendance from sections A to G</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={attendanceStats.sectionData} barCategoryGap="20%">
              <defs>
                <linearGradient id="attendanceBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#cbd5e1"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#cbd5e1"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "avgAttendance" ? `${value}%` : value,
                  name === "avgAttendance" ? "Average Attendance" : "Students"
                ]}
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "14px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.35)"
                }}
                labelStyle={{ color: "#e2e8f0", fontWeight: 700 }}
              />
              <Legend />
              <Bar
                dataKey="avgAttendance"
                fill="url(#attendanceBar)"
                name="Average Attendance"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCard}>
          <div style={chartHeader}>
            <div>
              <h3 style={sectionTitle}>Attendance Distribution</h3>
              <p style={sectionSubText}>Excellent vs average vs low</p>
            </div>
          </div>

          {attendanceStats.attendanceDistribution.length === 0 ? (
            <p style={emptyText}>No attendance data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={attendanceStats.attendanceDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {attendanceStats.attendanceDistribution.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "14px",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.35)"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={chartCardLarge}>
        <div style={chartHeader}>
          <div>
            <h3 style={sectionTitle}>Section Trend Area</h3>
            <p style={sectionSubText}>Smooth visual comparison of section average attendance</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={attendanceStats.sectionData}>
            <defs>
              <linearGradient id="attendanceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#cbd5e1"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#cbd5e1"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Average Attendance"]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "14px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)"
              }}
            />
            <Area
              type="monotone"
              dataKey="avgAttendance"
              stroke="#22d3ee"
              strokeWidth={3}
              fill="url(#attendanceArea)"
              name="Avg Attendance"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>Section Attendance Summary</h3>
        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Section</th>
                <th style={th}>Students</th>
                <th style={th}>Avg Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendanceStats.sectionData.map((section) => (
                <tr key={section.name}>
                  <td style={td}>{section.name}</td>
                  <td style={td}>{section.students}</td>
                  <td style={td}>{section.avgAttendance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>Low Attendance Students</h3>
        {attendanceStats.lowAttendanceStudents.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {attendanceStats.lowAttendanceStudents.map((student) => (
                  <tr key={student.id}>
                    <td style={td}>{student.name}</td>
                    <td style={td}>{student.rollNo}</td>
                    <td style={td}>{student.section}</td>
                    <td style={{ ...td, color: "#f87171", fontWeight: "800" }}>
                      {student.attendance}%
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

export default HODAttendance;

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

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr",
  gap: "24px",
  marginBottom: "24px"
};

const cardBase = {
  padding: "24px",
  borderRadius: "22px",
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

const cardGlowGreen = {
  ...cardGlowBase,
  background: "#22c55e"
};

const cardGlowYellow = {
  ...cardGlowBase,
  background: "#facc15"
};

const cardGlowRed = {
  ...cardGlowBase,
  background: "#ef4444"
};

const value = {
  position: "relative",
  fontSize: "30px",
  fontWeight: "800",
  color: "#f8fafc",
  margin: "0 0 10px 0"
};

const successValue = {
  ...value,
  color: "#4ade80"
};

const warningValue = {
  ...value,
  color: "#facc15"
};

const dangerValue = {
  ...value,
  color: "#f87171"
};

const label = {
  position: "relative",
  color: "#cbd5e1",
  fontSize: "14px",
  margin: 0,
  fontWeight: "500",
  lineHeight: "1.5"
};

const chartCard = {
  background: "rgba(15,23,42,0.92)",
  padding: "22px",
  borderRadius: "22px",
  border: "1px solid rgba(148,163,184,0.16)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
};

const chartCardLarge = {
  background: "rgba(15,23,42,0.92)",
  padding: "22px",
  borderRadius: "22px",
  border: "1px solid rgba(148,163,184,0.16)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  marginBottom: "24px"
};

const chartHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "14px"
};

const sectionTitle = {
  color: "#38bdf8",
  margin: 0,
  fontSize: "20px",
  fontWeight: "800"
};

const sectionSubText = {
  color: "#94a3b8",
  margin: "6px 0 0 0",
  fontSize: "14px"
};

const tableBox = {
  background: "rgba(15,23,42,0.92)",
  padding: "22px",
  borderRadius: "22px",
  border: "1px solid rgba(148,163,184,0.16)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  marginBottom: "24px"
};

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

const emptyText = {
  color: "#94a3b8"
};