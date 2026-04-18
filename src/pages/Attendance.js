import { useEffect, useState } from "react";
import API from "../api/api";

function Attendance() {
  const [attendance, setAttendance] = useState({
    sem11: "",
    sem12: "",
    sem21: "",
    sem22: "",
    sem31: "",
    sem32: "",
    sem41: "",
    sem42: ""
  });

  useEffect(() => {
    const currentEmail = (localStorage.getItem("userEmail") || "")
      .trim()
      .toLowerCase();

    if (!currentEmail) return;

    const fetchFromPerformance = async () => {
      try {
        const res = await API.get(`/performance/${currentEmail}`);

        if (res.data.success && res.data.data) {
          const data = res.data.data;

          const calcSemAttendance = (sem) => {
            const subjects = data[sem]?.subjects || [];

            let total = 0;
            let count = 0;

            subjects.forEach((sub) => {
              const months = sub.attendance || {};

              Object.values(months).forEach((val) => {
                if (val !== "" && val !== null && val !== undefined) {
                  total += Number(val);
                  count++;
                }
              });
            });

            return count > 0 ? (total / count).toFixed(2) : "";
          };

          setAttendance({
            sem11: calcSemAttendance("11"),
            sem12: calcSemAttendance("12"),
            sem21: calcSemAttendance("21"),
            sem22: calcSemAttendance("22"),
            sem31: calcSemAttendance("31"),
            sem32: calcSemAttendance("32"),
            sem41: calcSemAttendance("41"),
            sem42: calcSemAttendance("42")
          });
        }
      } catch (error) {
        console.log("Fetch performance attendance failed:", error);
      }
    };

    fetchFromPerformance();
  }, []);

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={heading}>ATTENDANCE RECORD</h2>
        <p style={subText}>% Attendance / Condonation / Detention</p>

        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>1st – 1st Sem</th>
                <th style={th}>1st – 2nd Sem</th>
                <th style={th}>2nd – 1st Sem</th>
                <th style={th}>2nd – 2nd Sem</th>
                <th style={th}>3rd – 1st Sem</th>
                <th style={th}>3rd – 2nd Sem</th>
                <th style={th}>4th – 1st Sem</th>
                <th style={th}>4th – 2nd Sem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}><input value={attendance.sem11} readOnly style={input} /></td>
                <td style={td}><input value={attendance.sem12} readOnly style={input} /></td>
                <td style={td}><input value={attendance.sem21} readOnly style={input} /></td>
                <td style={td}><input value={attendance.sem22} readOnly style={input} /></td>
                <td style={td}><input value={attendance.sem31} readOnly style={input} /></td>
                <td style={td}><input value={attendance.sem32} readOnly style={input} /></td>
                <td style={td}><input value={attendance.sem41} readOnly style={input} /></td>
                <td style={td}><input value={attendance.sem42} readOnly style={input} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Attendance;

/* SAME STYLES */
const container = { padding: "20px", color: "#e2e8f0" };
const card = {
  background: "#0f172a",
  padding: "24px",
  borderRadius: "14px",
  marginBottom: "24px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.28)"
};
const heading = {
  color: "#38bdf8",
  textAlign: "center",
  fontSize: "28px",
  marginBottom: "10px"
};
const subText = {
  color: "#cbd5e1",
  fontWeight: "600",
  marginBottom: "14px"
};
const tableWrapper = { overflowX: "auto" };
const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "980px",
  background: "#111827"
};
const th = {
  padding: "14px",
  textAlign: "center",
  background: "#1e293b",
  color: "#38bdf8",
  border: "1px solid #334155"
};
const td = {
  padding: "10px",
  border: "1px solid #334155",
  background: "#0f172a"
};
const input = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#e2e8f0",
  textAlign: "center"
};