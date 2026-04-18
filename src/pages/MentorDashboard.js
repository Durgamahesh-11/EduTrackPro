import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
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

function getPerformanceFromCGPA(cgpa) {
  const value = getValidNumber(cgpa);
  if (value === null || value === 0) return null;
  return Number(((value / 10) * 100).toFixed(1));
}

function MentorDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/mentor/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching mentor dashboard data:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const stats = useMemo(() => {
    const normalized = students.map((student, index) => {
      const rawAttendance = getValidNumber(student.attendance);
      const rawCGPA = getValidNumber(student.cgpa);
      const performanceFromCGPA = getPerformanceFromCGPA(rawCGPA);

      return {
        ...student,
        id: student.id || index,
        attendanceForAvg: rawAttendance,
        cgpaForAvg: rawCGPA,
        performanceForAvg: performanceFromCGPA
      };
    });

    const validAttendance = normalized.filter((s) => s.attendanceForAvg !== null);
    const validCGPA = normalized.filter((s) => s.cgpaForAvg !== null);
    const validPerformance = normalized.filter((s) => s.performanceForAvg !== null);

    const totalStudents = normalized.length;

    const avgAttendance = validAttendance.length
      ? (
          validAttendance.reduce((sum, s) => sum + s.attendanceForAvg, 0) /
          validAttendance.length
        ).toFixed(1)
      : "0.0";

    const avgPerformance = validPerformance.length
      ? (
          validPerformance.reduce((sum, s) => sum + s.performanceForAvg, 0) /
          validPerformance.length
        ).toFixed(1)
      : "0.0";

    const avgCGPA = validCGPA.length
      ? (
          validCGPA.reduce((sum, s) => sum + s.cgpaForAvg, 0) / validCGPA.length
        ).toFixed(2)
      : "0.00";

    const lowAttendanceCount = normalized.filter(
      (s) => s.attendanceForAvg !== null && s.attendanceForAvg < 75
    ).length;

    const attendancePieData = [
      { name: "Average Attendance", value: Number(avgAttendance) },
      { name: "Remaining", value: Math.max(0, 100 - Number(avgAttendance)) }
    ];

    const performancePieData = [
      { name: "Average Performance", value: Number(avgPerformance) },
      { name: "Remaining", value: Math.max(0, 100 - Number(avgPerformance)) }
    ];

    return {
      totalStudents,
      avgAttendance,
      avgPerformance,
      avgCGPA,
      lowAttendanceCount,
      attendancePieData,
      performancePieData
    };
  }, [students]);

  return (
    <div style={container}>
      <div style={headerWrap}>
        <div>
          <h2 style={title}>👨‍🏫 Mentor Dashboard</h2>
          <p style={subtitle}>
            View the academic condition of all your assigned students.
          </p>
        </div>

        <button style={refreshBtn} onClick={fetchStudents}>
          Refresh
        </button>
      </div>

      <div style={cardsGrid}>
        <div style={cardBlue}>
          <p style={cardLabel}>Total Students</p>
          <h3 style={cardValue}>{loading ? "..." : stats.totalStudents}</h3>
        </div>

        <div style={cardCyan}>
          <p style={cardLabel}>Overall Average Attendance</p>
          <h3 style={cardValue}>{loading ? "..." : `${stats.avgAttendance}%`}</h3>
        </div>

        <div style={cardGreen}>
          <p style={cardLabel}>Overall Average Performance</p>
          <h3 style={cardValue}>{loading ? "..." : `${stats.avgPerformance}%`}</h3>
        </div>

        <div style={cardPurple}>
          <p style={cardLabel}>Overall Average CGPA</p>
          <h3 style={cardValue}>{loading ? "..." : stats.avgCGPA}</h3>
        </div>

        <div style={cardRed}>
          <p style={cardLabel}>Low Attendance Students</p>
          <h3 style={cardValue}>{loading ? "..." : stats.lowAttendanceCount}</h3>
        </div>
      </div>

      <div style={quickActionsBox}>
        <h3 style={sectionTitle}>Quick Actions</h3>
        <div style={quickActionsGrid}>
          <Link to="/students" style={actionCard}>
            👥 Students List
          </Link>
          <Link to="/alerts" style={actionCard}>
            🚨 Alerts
          </Link>
        </div>
      </div>

      <div style={chartsGrid}>
        <div style={chartCard}>
          <h3 style={sectionTitle}>📊 Overall Attendance</h3>

          {loading ? (
            <p style={loadingText}>Loading attendance...</p>
          ) : (
            <>
              <div style={pieWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.attendancePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#06b6d4" />
                      <Cell fill="#1e293b" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={centerValue}>{stats.avgAttendance}%</div>
              <p style={chartNote}>Average attendance of all assigned students</p>
            </>
          )}
        </div>

        <div style={chartCard}>
          <h3 style={sectionTitle}>📈 Overall Performance</h3>

          {loading ? (
            <p style={loadingText}>Loading performance...</p>
          ) : (
            <>
              <div style={pieWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.performancePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#1e293b" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={centerValue}>{stats.avgPerformance}%</div>
              <p style={chartNote}>Performance calculated from CGPA of all assigned students</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;

const container = {
  padding: "24px",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #020617, #071132, #0f172a)",
  color: "#e2e8f0"
};

const headerWrap = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "24px"
};

const title = {
  fontSize: "38px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: 0
};

const subtitle = {
  color: "#cbd5e1",
  marginTop: "10px",
  marginBottom: 0,
  fontSize: "16px"
};

const refreshBtn = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(90deg, #2563eb, #06b6d4)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "26px"
};

const cardBase = {
  padding: "24px",
  borderRadius: "22px",
  boxShadow: "0 14px 35px rgba(0,0,0,0.28)",
  border: "1px solid rgba(255,255,255,0.08)"
};

const cardBlue = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))"
};

const cardCyan = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(8,47,73,0.98), rgba(15,23,42,0.98))"
};

const cardGreen = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(20,83,45,0.98), rgba(15,23,42,0.98))"
};

const cardPurple = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(76,29,149,0.98), rgba(15,23,42,0.98))"
};

const cardRed = {
  ...cardBase,
  background: "linear-gradient(145deg, rgba(127,29,29,0.98), rgba(15,23,42,0.98))"
};

const cardLabel = {
  margin: 0,
  fontSize: "15px",
  color: "#cbd5e1",
  fontWeight: "600"
};

const cardValue = {
  margin: "16px 0 0 0",
  fontSize: "34px",
  fontWeight: "800",
  color: "#38bdf8"
};

const quickActionsBox = {
  background: "rgba(15,23,42,0.92)",
  borderRadius: "22px",
  padding: "22px",
  marginBottom: "26px",
  border: "1px solid rgba(148,163,184,0.14)"
};

const sectionTitle = {
  color: "#38bdf8",
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "18px",
  fontWeight: "800"
};

const quickActionsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px"
};

const actionCard = {
  display: "block",
  textDecoration: "none",
  textAlign: "center",
  padding: "18px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #1e293b, #0f172a)",
  color: "#e2e8f0",
  fontWeight: "700",
  border: "1px solid #334155"
};

const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px"
};

const chartCard = {
  background: "rgba(15,23,42,0.92)",
  borderRadius: "22px",
  padding: "22px",
  border: "1px solid rgba(148,163,184,0.14)",
  minHeight: "420px",
  position: "relative"
};

const loadingText = {
  color: "#cbd5e1"
};

const pieWrapper = {
  width: "100%",
  height: "300px"
};

const centerValue = {
  textAlign: "center",
  fontSize: "32px",
  fontWeight: "800",
  color: "#38bdf8",
  marginTop: "-10px"
};

const chartNote = {
  textAlign: "center",
  color: "#cbd5e1",
  fontSize: "14px",
  marginTop: "10px"
};