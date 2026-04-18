import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

function StudentAlerts() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const toNumberOrNull = (value) => {
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
  };

  const formatSemester = (sem) => {
    if (!sem || sem === "-") return "-";

    const s = String(sem);
    return s.length === 2 ? `${s[0]}-${s[1]}` : s;
  };

  const getLatestSemester = (performanceData) => {
    const semesterOrder = ["11", "12", "21", "22", "31", "32", "41", "42"];
    let latestSemester = "-";

    semesterOrder.forEach((sem) => {
      const semInfo = performanceData?.[sem];
      if (!semInfo) return;

      const cgpa = toNumberOrNull(semInfo.cgpa);
      const attendance = toNumberOrNull(
        semInfo.semesterAttendance ?? semInfo.attendance
      );

      if (cgpa !== null || attendance !== null) {
        latestSemester = sem;
      }
    });

    return latestSemester;
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      const currentEmail = (localStorage.getItem("userEmail") || "")
        .trim()
        .toLowerCase();

      if (!currentEmail) {
        setStudent(null);
        return;
      }

      const [profileRes, performanceRes] = await Promise.allSettled([
        API.get(`/students/profile/${currentEmail}`),
        API.get(`/performance/${currentEmail}`)
      ]);

      const profile =
        profileRes.status === "fulfilled"
          ? profileRes.value?.data?.data || null
          : null;

      const performanceData =
        performanceRes.status === "fulfilled"
          ? performanceRes.value?.data?.data || {}
          : {};

      const attendanceFromProfile = toNumberOrNull(profile?.attendance);
      const cgpaFromProfile = toNumberOrNull(profile?.cgpa);

      setStudent({
        ...(profile || {}),
        studentName: profile?.student_name || profile?.name || "Student",
        attendance: attendanceFromProfile,
        cgpa: cgpaFromProfile,
        latestSemester: getLatestSemester(performanceData)
      });
    } catch (error) {
      console.log("Error fetching student alerts:", error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const alertInfo = useMemo(() => {
    if (!student) {
      return {
        hasAlerts: false,
        alerts: [],
        tips: []
      };
    }

    const attendance = student.attendance;
    const cgpa = student.cgpa;

    const alerts = [];
    const tips = [];

    if (attendance !== null && attendance < 75) {
      alerts.push({
        title: "Low Attendance Alert",
        message: `Your attendance is ${attendance}%. It is below the safe level of 75%.`,
        level: "danger"
      });

      tips.push("Attend all upcoming classes regularly.");
      tips.push("Avoid unnecessary leaves until your attendance improves.");
      tips.push("Meet your mentor if you are facing any genuine problem.");
      tips.push("Check your attendance every week.");
    }

    if (cgpa !== null && cgpa < 6) {
      alerts.push({
        title: "Low Performance Alert",
        message: `Your CGPA is ${cgpa}. Your academic performance needs improvement.`,
        level: "warning"
      });

      tips.push("Prepare a daily study plan for weak subjects.");
      tips.push("Practice previous questions and revise class notes.");
      tips.push("Ask faculty or mentor for help in difficult subjects.");
      tips.push("Focus more on backlog or low-scoring subjects.");
    }

    if (
      (attendance === null || attendance >= 75) &&
      (cgpa === null || cgpa >= 6)
    ) {
      tips.push("You are doing well. Maintain the same consistency.");
      tips.push("Keep balancing attendance, assignments, and exam preparation.");
      tips.push("Try to improve step by step every semester.");
    }

    return {
      hasAlerts: alerts.length > 0,
      alerts,
      tips: [...new Set(tips)]
    };
  }, [student]);

  return (
    <div style={container}>
      <div style={heroBox}>
        <div>
          <p style={eyebrow}>Student Support</p>
          <h2 style={title}>🚨 My Alerts</h2>
          <p style={subtitle}>
            Attendance and performance guidance for improvement
          </p>
        </div>

        <button style={refreshBtn} onClick={fetchStudentData}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={emptyCard}>
          <p style={emptyText}>Loading alerts...</p>
        </div>
      ) : !student ? (
        <div style={emptyCard}>
          <p style={emptyText}>Unable to load student data ❌</p>
        </div>
      ) : (
        <>
          <div style={summaryGrid}>
            <div style={summaryCard}>
              <p style={summaryLabel}>Student</p>
              <h3 style={summaryValue}>{student.studentName}</h3>
            </div>

            <div style={summaryCard}>
              <p style={summaryLabel}>Attendance</p>
              <h3
                style={{
                  ...summaryValue,
                  color:
                    student.attendance !== null && student.attendance < 75
                      ? "#f87171"
                      : "#38bdf8"
                }}
              >
                {student.attendance !== null ? `${student.attendance}%` : "-"}
              </h3>
            </div>

            <div style={summaryCard}>
              <p style={summaryLabel}>CGPA</p>
              <h3
                style={{
                  ...summaryValue,
                  color:
                    student.cgpa !== null && student.cgpa < 6
                      ? "#facc15"
                      : "#38bdf8"
                }}
              >
                {student.cgpa !== null ? student.cgpa : "-"}
              </h3>
            </div>

            <div style={summaryCard}>
              <p style={summaryLabel}>Latest Semester</p>
              <h3 style={summaryValue}>
                {formatSemester(student.latestSemester)}
              </h3>
            </div>
          </div>

          <div style={mainGrid}>
            <div style={sectionCard}>
              <h3 style={sectionTitle}>Alert Status</h3>

              {!alertInfo.hasAlerts ? (
                <div style={goodBox}>
                  <h4 style={goodTitle}>✅ No Critical Alerts</h4>
                  <p style={goodText}>
                    Your attendance and performance are currently in a safe range.
                  </p>
                </div>
              ) : (
                <div style={alertsList}>
                  {alertInfo.alerts.map((alert, index) => (
                    <div
                      key={index}
                      style={
                        alert.level === "danger" ? dangerAlertCard : warningAlertCard
                      }
                    >
                      <h4 style={alertTitle}>{alert.title}</h4>
                      <p style={alertText}>{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={sectionCard}>
              <h3 style={sectionTitle}>Guidance for You</h3>

              <div style={tipsList}>
                {alertInfo.tips.map((tip, index) => (
                  <div key={index} style={tipCard}>
                    <span style={tipNumber}>{index + 1}</span>
                    <p style={tipText}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentAlerts;

const container = {
  padding: "24px",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)",
  color: "#e2e8f0"
};

const heroBox = {
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
  background: "linear-gradient(90deg,#2563eb,#06b6d4)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(37,99,235,0.28)"
};

const emptyCard = {
  background: "rgba(15,23,42,0.95)",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid rgba(148,163,184,0.15)"
};

const emptyText = {
  color: "#cbd5e1",
  margin: 0
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const summaryCard = {
  background: "rgba(15,23,42,0.95)",
  padding: "22px",
  borderRadius: "20px",
  border: "1px solid rgba(148,163,184,0.15)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const summaryLabel = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "14px"
};

const summaryValue = {
  margin: "10px 0 0 0",
  color: "#38bdf8",
  fontSize: "28px",
  fontWeight: "800"
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px"
};

const sectionCard = {
  background: "rgba(15,23,42,0.95)",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid rgba(148,163,184,0.15)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#38bdf8",
  fontSize: "22px",
  fontWeight: "800"
};

const goodBox = {
  background: "linear-gradient(145deg, rgba(20,83,45,0.96), rgba(5,46,22,0.96))",
  padding: "20px",
  borderRadius: "16px",
  border: "1px solid rgba(74,222,128,0.22)"
};

const goodTitle = {
  marginTop: 0,
  marginBottom: "8px",
  color: "#4ade80",
  fontSize: "20px"
};

const goodText = {
  margin: 0,
  color: "#dcfce7"
};

const alertsList = {
  display: "grid",
  gap: "16px"
};

const dangerAlertCard = {
  background: "linear-gradient(145deg, rgba(127,29,29,0.96), rgba(69,10,10,0.96))",
  padding: "18px",
  borderRadius: "16px",
  border: "1px solid rgba(248,113,113,0.22)"
};

const warningAlertCard = {
  background: "linear-gradient(145deg, rgba(120,53,15,0.96), rgba(69,26,3,0.96))",
  padding: "18px",
  borderRadius: "16px",
  border: "1px solid rgba(250,204,21,0.22)"
};

const alertTitle = {
  marginTop: 0,
  marginBottom: "8px",
  color: "#f8fafc",
  fontSize: "19px",
  fontWeight: "800"
};

const alertText = {
  margin: 0,
  color: "#e2e8f0",
  lineHeight: "1.6"
};

const tipsList = {
  display: "grid",
  gap: "14px"
};

const tipCard = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  background: "linear-gradient(135deg, #1e293b, #0f172a)",
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid #334155"
};

const tipNumber = {
  minWidth: "30px",
  height: "30px",
  borderRadius: "999px",
  background: "#2563eb",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  fontSize: "14px"
};

const tipText = {
  margin: 0,
  color: "#e2e8f0",
  lineHeight: "1.6"
};