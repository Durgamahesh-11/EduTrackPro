import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

function Analytics() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("students")) || [];
    setStudents(data);
  }, []);

  // ================= BASIC STATS =================
  const total = students.length;

  const avgAttendance = total
    ? (students.reduce((sum, s) => sum + Number(s.attendance || 0), 0) / total).toFixed(2)
    : 0;

  const avgCGPA = total
    ? (students.reduce((sum, s) => sum + Number(s.cgpa || 0), 0) / total).toFixed(2)
    : 0;

  // ================= DEPARTMENT DATA =================
  const deptMap = {};

  students.forEach((s) => {
    if (!deptMap[s.department]) {
      deptMap[s.department] = {
        department: s.department,
        students: 0,
        totalAttendance: 0,
        totalCGPA: 0
      };
    }

    deptMap[s.department].students += 1;
    deptMap[s.department].totalAttendance += Number(s.attendance || 0);
    deptMap[s.department].totalCGPA += Number(s.cgpa || 0);
  });

  const deptData = Object.values(deptMap).map((d) => ({
    department: d.department,
    avgAttendance: (d.totalAttendance / d.students).toFixed(2),
    avgCGPA: (d.totalCGPA / d.students).toFixed(2)
  }));

  // ================= PIE DATA =================
  const pieData = deptData.map((d) => ({
    name: d.department,
    value: Number(d.avgAttendance)
  }));

  const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];

  return (
    <div>
      <h2>📊 Admin Analytics Dashboard</h2>

      {/* TOP CARDS */}
      <div style={cardContainer}>
        <div style={card}>
          <h3>{total}</h3>
          <p>Total Students</p>
        </div>

        <div style={card}>
          <h3>{avgAttendance}%</h3>
          <p>Avg Attendance</p>
        </div>

        <div style={card}>
          <h3>{avgCGPA}</h3>
          <p>Avg CGPA</p>
        </div>
      </div>

      {/* BAR CHART */}
      <div style={chartBox}>
        <h3>Department-wise Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={deptData}>
            <XAxis dataKey="department" stroke="#ccc" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="avgAttendance" fill="#3b82f6" name="Attendance %" />
            <Bar dataKey="avgCGPA" fill="#06b6d4" name="CGPA" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}
      <div style={chartBox}>
        <h3>Attendance Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;

/* ================= STYLES ================= */

const cardContainer = {
  display: "flex",
  gap: "20px",
  margin: "20px 0"
};

const card = {
  flex: 1,
  padding: "20px",
  background: "linear-gradient(135deg, #1e3a8a, #0ea5e9)",
  color: "white",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
};

const chartBox = {
  marginTop: "30px",
  padding: "20px",
  background: "#0f172a",
  borderRadius: "12px",
  color: "white"
};