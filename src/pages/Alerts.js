import { useEffect, useState, useCallback, useMemo } from "react";
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

function Alerts() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/mentor/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching mentor alerts:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const alertStudents = useMemo(() => {
    return students
      .map((student) => ({
        ...student,
        attendanceValue: getValidNumber(student.attendance)
      }))
      .filter((student) => student.attendanceValue !== null && student.attendanceValue < 75)
      .sort((a, b) => a.attendanceValue - b.attendanceValue);
  }, [students]);

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h2 style={title}>🚨 Low Attendance Alerts</h2>
          <p style={subtitle}>Students with attendance below 75%</p>
        </div>

        <button style={refreshBtn} onClick={fetchStudents}>
          Refresh
        </button>
      </div>

      <div style={card}>
        {loading ? (
          <p style={safeText}>Loading alerts...</p>
        ) : alertStudents.length === 0 ? (
          <p style={safeText}>No low attendance alerts ✅</p>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Roll No</th>
                  <th style={th}>Department</th>
                  <th style={th}>Section</th>
                  <th style={th}>Attendance</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {alertStudents.map((student, index) => (
                  <tr key={student.id || index}>
                    <td style={td}>{student.student_name || student.name || "-"}</td>
                    <td style={td}>
                      <span style={rollText}>
                        {student.roll_no || student.reg_no || "-"}
                      </span>
                    </td>
                    <td style={td}>{student.department || "-"}</td>
                    <td style={td}>{student.section || "-"}</td>
                    <td style={{ ...td, color: "#ff6b6b", fontWeight: "700" }}>
                      {student.attendanceValue}%
                    </td>
                    <td style={{ ...td, color: "#ff6b6b", fontWeight: "700" }}>
                      Below 75%
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

export default Alerts;

const page = {
  padding: "24px",
  color: "#e2e8f0"
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px"
};

const title = {
  color: "#38bdf8",
  fontSize: "28px",
  fontWeight: "800",
  marginBottom: "8px"
};

const subtitle = {
  color: "#a5b4cc",
  marginBottom: "0",
  fontSize: "15px"
};

const refreshBtn = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(90deg, #2563eb, #06b6d4)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
};

const card = {
  background: "#071a3a",
  borderRadius: "22px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.28)"
};

const tableWrapper = {
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  textAlign: "left",
  padding: "16px 14px",
  background: "#223555",
  color: "#38bdf8",
  fontWeight: "700",
  fontSize: "15px"
};

const td = {
  padding: "18px 14px",
  borderBottom: "1px solid rgba(148,163,184,0.12)",
  color: "#ffffff",
  fontSize: "15px"
};

const rollText = {
  color: "#1fb6ff",
  fontWeight: "700"
};

const safeText = {
  color: "#34d399",
  fontWeight: "700"
};