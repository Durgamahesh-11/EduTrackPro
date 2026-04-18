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

function HODPerformance() {
  const [students, setStudents] = useState([]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await API.get("/hod/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching performance:", error);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const performanceStats = useMemo(() => {
    const merged = students.map((student, index) => {
      const cgpa =
        student.cgpa !== "-" &&
        student.cgpa !== "" &&
        student.cgpa !== null &&
        Number(student.cgpa) > 0 &&
        !Number.isNaN(Number(student.cgpa))
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
        rollNo: student.roll_no || student.reg_no || "-",
        section: (student.section || "N/A").toUpperCase(),
        cgpa
      };
    });

    const sectionMap = {};
    SECTION_ORDER.forEach((sec) => {
      sectionMap[sec] = { name: sec, students: 0, values: [] };
    });

    merged.forEach((s) => {
      const sec = s.section;
      if (!sectionMap[sec]) {
        sectionMap[sec] = { name: sec, students: 0, values: [] };
      }
      sectionMap[sec].students += 1;
      if (s.cgpa !== null) sectionMap[sec].values.push(s.cgpa);
    });

    const sectionData = Object.values(sectionMap).map((sec) => ({
      name: sec.name,
      students: sec.students,
      avgCGPA: sec.values.length
        ? Number(
            (sec.values.reduce((a, b) => a + b, 0) / sec.values.length).toFixed(2)
          )
        : 0
    }));

    const valid = merged.map((s) => s.cgpa).filter((v) => v !== null);

    const overallAvgCGPA = valid.length
      ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)
      : "0.00";

    const high = merged.filter((s) => s.cgpa !== null && s.cgpa >= 8).length;
    const avg = merged.filter(
      (s) => s.cgpa !== null && s.cgpa >= 6 && s.cgpa < 8
    ).length;
    const low = merged.filter((s) => s.cgpa !== null && s.cgpa < 6).length;

    const lowPerformanceStudents = merged
      .filter((s) => s.cgpa !== null && s.cgpa < 6)
      .sort((a, b) => a.cgpa - b.cgpa);

    const performanceDistribution = [
      { name: "High", value: high },
      { name: "Average", value: avg },
      { name: "Low", value: low }
    ].filter((item) => item.value > 0);

    return {
      totalStudents: merged.length,
      overallAvgCGPA,
      high,
      avg,
      low,
      sectionData,
      lowPerformanceStudents,
      performanceDistribution
    };
  }, [students]);

  return (
    <div style={container}>
      <div style={heroSection}>
        <div>
          <p style={eyebrow}>HOD Performance Overview</p>
          <h2 style={title}>📈 Section Performance Dashboard</h2>
          <p style={subtitle}>Premium CGPA analytics and section-wise performance insights</p>
        </div>

        <button style={refreshBtn} onClick={fetchStudents}>
          Refresh
        </button>
      </div>

      <div style={cardsGrid}>
        <div style={card}>
          <div style={cardGlowBlue} />
          <h3 style={value}>{performanceStats.totalStudents}</h3>
          <p style={label}>Total Students</p>
        </div>

        <div style={card}>
          <div style={cardGlowCyan} />
          <h3 style={value}>{performanceStats.overallAvgCGPA}</h3>
          <p style={label}>Overall Avg CGPA</p>
        </div>

        <div style={successCard}>
          <div style={cardGlowGreen} />
          <h3 style={successValue}>{performanceStats.high}</h3>
          <p style={label}>High Performers</p>
        </div>

        <div style={warningCard}>
          <div style={cardGlowYellow} />
          <h3 style={warningValue}>{performanceStats.avg}</h3>
          <p style={label}>Average Performers</p>
        </div>

        <div style={dangerCard}>
          <div style={cardGlowRed} />
          <h3 style={dangerValue}>{performanceStats.low}</h3>
          <p style={label}>Low Performers</p>
        </div>
      </div>

      <div style={chartsGrid}>
        <div style={chartCardLarge}>
          <div style={chartHeader}>
            <div>
              <h3 style={sectionTitle}>Section-wise CGPA</h3>
              <p style={sectionSubText}>Average CGPA comparison from sections A to G</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={performanceStats.sectionData} barCategoryGap="20%">
              <defs>
                <linearGradient id="cgpaBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
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
                domain={[0, 10]}
                stroke="#cbd5e1"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "avgCGPA" ? value : value,
                  name === "avgCGPA" ? "Average CGPA" : "Students"
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
                dataKey="avgCGPA"
                fill="url(#cgpaBar)"
                name="Average CGPA"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCard}>
          <div style={chartHeader}>
            <div>
              <h3 style={sectionTitle}>Performance Distribution</h3>
              <p style={sectionSubText}>High vs average vs low performers</p>
            </div>
          </div>

          {performanceStats.performanceDistribution.length === 0 ? (
            <p style={emptyText}>No performance data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={performanceStats.performanceDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {performanceStats.performanceDistribution.map((entry, index) => (
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
            <p style={sectionSubText}>Smooth section-wise CGPA trend visualization</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceStats.sectionData}>
            <defs>
              <linearGradient id="cgpaArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.08} />
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
              domain={[0, 10]}
              stroke="#cbd5e1"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [value, "Average CGPA"]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "14px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)"
              }}
            />
            <Area
              type="monotone"
              dataKey="avgCGPA"
              stroke="#a855f7"
              strokeWidth={3}
              fill="url(#cgpaArea)"
              name="Avg CGPA"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>Section Performance Summary</h3>
        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Section</th>
                <th style={th}>Students</th>
                <th style={th}>Avg CGPA</th>
              </tr>
            </thead>
            <tbody>
              {performanceStats.sectionData.map((sec) => (
                <tr key={sec.name}>
                  <td style={td}>{sec.name}</td>
                  <td style={td}>{sec.students}</td>
                  <td style={td}>{sec.avgCGPA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>Low Performance Students</h3>
        {performanceStats.lowPerformanceStudents.length === 0 ? (
          <p style={emptyText}>No low performers ✅</p>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Roll No</th>
                  <th style={th}>Section</th>
                  <th style={th}>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {performanceStats.lowPerformanceStudents.map((student) => (
                  <tr key={student.id}>
                    <td style={td}>{student.name}</td>
                    <td style={td}>{student.rollNo}</td>
                    <td style={td}>{student.section}</td>
                    <td style={{ ...td, color: "#f87171", fontWeight: "800" }}>
                      {student.cgpa}
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

export default HODPerformance;

const container = {
  padding: "24px",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)",
  color: "#e2e8f0"
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
  color: "#c084fc",
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
  color: "#94a3b8",
  marginTop: "10px",
  marginBottom: 0,
  fontSize: "15px"
};

const refreshBtn = {
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

const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr",
  gap: "24px",
  marginBottom: "24px"
};

const baseCard = {
  padding: "24px",
  borderRadius: "22px",
  position: "relative",
  overflow: "hidden",
  backdropFilter: "blur(10px)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.32)"
};

const card = {
  ...baseCard,
  background: "linear-gradient(145deg, rgba(30,41,59,0.98), rgba(15,23,42,0.96))",
  border: "1px solid rgba(148, 163, 184, 0.16)"
};

const successCard = {
  ...baseCard,
  background: "linear-gradient(145deg, rgba(20,83,45,0.96), rgba(5,46,22,0.96))",
  border: "1px solid rgba(74,222,128,0.22)"
};

const warningCard = {
  ...baseCard,
  background: "linear-gradient(145deg, rgba(120,53,15,0.96), rgba(69,26,3,0.96))",
  border: "1px solid rgba(250,204,21,0.22)"
};

const dangerCard = {
  ...baseCard,
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
  margin: "0 0 10px 0",
  color: "#f8fafc"
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
  marginTop: "8px",
  color: "#cbd5e1",
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