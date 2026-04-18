import { useEffect, useState } from "react";
import "./Dashboard.css";
import API from "../api/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";

function Dashboard() {
  const [student, setStudent] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [alertStatus, setAlertStatus] = useState({
    attendance: null,
    cgpa: null
  });

  useEffect(() => {
    const currentEmail = (localStorage.getItem("userEmail") || "").trim().toLowerCase();

    if (!currentEmail) {
      setStudent(null);
      setPerformanceData(null);
      setAlertStatus({ attendance: null, cgpa: null });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const studentRes = await API.get(`/students/profile/${currentEmail}`);
        const performanceRes = await API.get(`/performance/${currentEmail}`);

        const currentStudent = studentRes.data?.success ? studentRes.data.data : null;
        const perf = performanceRes.data?.success ? performanceRes.data.data : null;

        let latestSemData = null;

        if (perf) {
          const order = ["42", "41", "32", "31", "22", "21", "12", "11"];

          for (const sem of order) {
            const semBlock = perf[sem];

            if (
              semBlock &&
              (
                (semBlock.subjects &&
                  semBlock.subjects.some((s) =>
                    (s.subjectCode || "").trim() !== "" ||
                    (s.subjectName || "").trim() !== "" ||
                    (s.cie1 || "").trim() !== "" ||
                    (s.cie2 || "").trim() !== "" ||
                    (s.viva || "").trim() !== "" ||
                    (s.finalGrade || "").trim() !== ""
                  )) ||
                (semBlock.percentage || "").trim() !== "" ||
                (semBlock.sgpa || "").trim() !== "" ||
                (semBlock.cgpa || "").trim() !== ""
              )
            ) {
              latestSemData = semBlock;
              break;
            }
          }
        }

        let attendanceValue = 0;

        if (latestSemData?.subjects?.length) {
          let total = 0;
          let count = 0;

          latestSemData.subjects.forEach((sub) => {
            Object.values(sub.attendance || {}).forEach((val) => {
              if (val !== "" && val !== null && val !== undefined) {
                const num = Number(val);
                if (!Number.isNaN(num)) {
                  total += num;
                  count++;
                }
              }
            });
          });

          attendanceValue = count > 0 ? Number((total / count).toFixed(2)) : 0;
        }

        const percentageValue =
          latestSemData?.percentage !== undefined &&
          latestSemData?.percentage !== null &&
          latestSemData?.percentage !== "" &&
          latestSemData?.percentage !== "-"
            ? Number(latestSemData.percentage)
            : null;

        const cgpaValue =
          latestSemData?.cgpa !== undefined &&
          latestSemData?.cgpa !== null &&
          latestSemData?.cgpa !== "" &&
          latestSemData?.cgpa !== "-"
            ? Number(latestSemData.cgpa)
            : null;

        const gradeFromCGPA = (cgpa) => {
          if (cgpa === null || cgpa === undefined || Number.isNaN(cgpa)) return "-";
          if (cgpa >= 9.1 && cgpa <= 10) return "O";
          if (cgpa >= 8.1 && cgpa <= 9.0) return "A+";
          if (cgpa >= 7.1 && cgpa <= 8.0) return "A";
          if (cgpa >= 6.1 && cgpa <= 7.0) return "B+";
          if (cgpa >= 5.1 && cgpa <= 6.0) return "B";
          if (cgpa >= 4.1 && cgpa <= 5.0) return "C";
          if (cgpa > 0 && cgpa <= 4.0) return "F";
          return "-";
        };

        const gradeValue = gradeFromCGPA(cgpaValue);

        setStudent(currentStudent || null);
        setPerformanceData({
          attendance: attendanceValue,
          percentage: percentageValue,
          cgpa: cgpaValue,
          grade: gradeValue
        });

        setAlertStatus({
          attendance: attendanceValue > 0 && attendanceValue < 75 ? attendanceValue : null,
          cgpa: cgpaValue !== null && cgpaValue < 6 ? cgpaValue : null
        });
      } catch (error) {
        console.log("Dashboard fetch error:", error);
        setStudent(null);
        setPerformanceData(null);
        setAlertStatus({ attendance: null, cgpa: null });
      }
    };

    fetchDashboardData();
  }, []);

  const attendanceValue =
    performanceData?.attendance !== undefined &&
    performanceData?.attendance !== null &&
    performanceData?.attendance !== "" &&
    performanceData?.attendance !== "-"
      ? Number(performanceData.attendance)
      : 0;

  const percentageRaw = performanceData?.percentage;
  const percentageValue =
    percentageRaw !== undefined &&
    percentageRaw !== null &&
    percentageRaw !== "" &&
    percentageRaw !== "-"
      ? Number(percentageRaw)
      : null;

  const cgpaRaw = performanceData?.cgpa;
  const cgpaValue =
    cgpaRaw !== undefined &&
    cgpaRaw !== null &&
    cgpaRaw !== "" &&
    cgpaRaw !== "-"
      ? Number(cgpaRaw)
      : null;

  const gradeValue =
    performanceData?.grade && performanceData.grade !== "-"
      ? performanceData.grade
      : "-";

  const studentRollNumber =
    student?.roll_no || student?.reg_no || student?.ht_no || "N/A";

  const attendanceChartData = [{ name: "Attendance", value: attendanceValue }];
  const performanceChartData = [
    { name: "Performance", value: percentageValue !== null ? percentageValue : 0 }
  ];
  const cgpaChartData = [
    { name: "CGPA", value: cgpaValue !== null ? cgpaValue * 10 : 0 }
  ];

  const hasAlerts = alertStatus.attendance !== null || alertStatus.cgpa !== null;

  return (
    <div className="dashboard-container">
      <h2 className="welcome">
        Welcome back {student?.student_name || student?.name || "Student"} 👋
      </h2>
      <p className="subtitle">Here’s your academic overview</p>

      {hasAlerts && (
        <div className="dashboard-alert-card">
          <div className="dashboard-alert-left">
            <div className="dashboard-alert-icon">⚠</div>
            <div>
              <h3 className="dashboard-alert-title">Action Required</h3>

              {alertStatus.attendance !== null && (
                <p className="dashboard-alert-text">
                  Your attendance is <strong>{alertStatus.attendance}%</strong>. Please attend classes regularly.
                </p>
              )}

              {alertStatus.cgpa !== null && (
                <p className="dashboard-alert-text">
                  Your CGPA is <strong>{alertStatus.cgpa}</strong>. Focus more on weak subjects and daily revision.
                </p>
              )}
            </div>
          </div>

          <a href="/student-alerts" className="dashboard-alert-btn">
            View Alerts
          </a>
        </div>
      )}

      {!student ? (
        <div className="section-box">
          <p>No student data found for this account.</p>
        </div>
      ) : (
        <>
          <div className="cards">
            <div className="card">
              <h3>{attendanceValue}%</h3>
              <p>Attendance</p>
            </div>

            <div className="card">
              <h3>{percentageValue === null ? "-" : `${percentageValue}%`}</h3>
              <p>Performance</p>
            </div>

            <div className="card">
              <h3>{cgpaValue === null ? "-" : cgpaValue}</h3>
              <p>CGPA</p>
            </div>

            <div className="card">
              <h3>{gradeValue}</h3>
              <p>Grade</p>
            </div>

            <div className="card">
              <h3>{studentRollNumber}</h3>
              <p>Roll Number</p>
            </div>
          </div>

          <div className="dashboard-graphs-grid">
            <div className="section-box chart-card small-chart-card">
              <div className="chart-header">
                <h3>Attendance</h3>
                <span className="chart-badge">Student</span>
              </div>

              <div className="chart-area small-chart-area">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis
                      dataKey="name"
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1", fontSize: 13 }}
                      axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1", fontSize: 13 }}
                      axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={70}>
                      <Cell fill="#38bdf8" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-box chart-card small-chart-card">
              <div className="chart-header">
                <h3>Performance</h3>
                <span className="chart-badge success-badge">Academic</span>
              </div>

              <div className="chart-area small-chart-area">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis
                      dataKey="name"
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1", fontSize: 13 }}
                      axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1", fontSize: 13 }}
                      axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={70}>
                      <Cell fill="#22c55e" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-box chart-card small-chart-card">
              <div className="chart-header">
                <h3>CGPA</h3>
                <span className="chart-badge purple-badge">Overall</span>
              </div>

              <div className="chart-area small-chart-area">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cgpaChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis
                      dataKey="name"
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1", fontSize: 13 }}
                      axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#cbd5e1"
                      tick={{ fill: "#cbd5e1", fontSize: 13 }}
                      axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={70}>
                      <Cell fill="#a78bfa" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  let displayValue = payload[0].value;

  if (label === "CGPA") {
    displayValue = payload[0].value === 0 ? "-" : (payload[0].value / 10).toFixed(2);
  } else if (label === "Performance") {
    displayValue = payload[0].value === 0 ? "-" : `${payload[0].value}%`;
  } else {
    displayValue = `${payload[0].value}%`;
  }

  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid rgba(148,163,184,0.25)",
        borderRadius: "10px",
        padding: "10px 12px",
        color: "#e2e8f0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)"
      }}
    >
      <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
      <p style={{ margin: "6px 0 0", color: "#38bdf8" }}>
        Value: {displayValue}
      </p>
    </div>
  );
}

export default Dashboard;