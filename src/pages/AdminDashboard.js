import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

function AdminDashboard() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    API.get("/admin/students")
      .then((res) => {
        setStudents(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log("Error fetching admin students:", err);
        setStudents([]);
      });
  }, []);

  const mergedStudents = useMemo(() => {
    return students.map((student, index) => {
      const attendance =
        student.attendance !== "-" &&
        student.attendance !== "" &&
        student.attendance !== null &&
        !isNaN(Number(student.attendance))
          ? Number(student.attendance)
          : null;

      const cgpa =
        student.cgpa !== "-" &&
        student.cgpa !== "" &&
        student.cgpa !== null &&
        !isNaN(Number(student.cgpa))
          ? Number(student.cgpa)
          : null;

      const department = student.department || student.dept || student.branch || "Unknown";
      const year = normalizeYear(student.year || getYearFromSemester(student.semester));

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
        department,
        section: student.section || "-",
        year,
        attendance,
        cgpa,
        grade: student.grade || "-",
        mentor_name: student.mentor_name || "-",
        hod_name: student.hod_name || "-",
        email: student.student_email || student.email || "-"
      };
    });
  }, [students]);

  const totalStudents = mergedStudents.length;
  const totalDepartments = [...new Set(mergedStudents.map((s) => s.department))].length;

  const avgAttendance = useMemo(() => {
    const validAttendance = mergedStudents.filter((s) => s.attendance !== null);
    return validAttendance.length
      ? (
          validAttendance.reduce((sum, s) => sum + s.attendance, 0) /
          validAttendance.length
        ).toFixed(1)
      : "0.0";
  }, [mergedStudents]);

  const avgCGPA = useMemo(() => {
    const validCgpa = mergedStudents.filter((s) => s.cgpa !== null);
    return validCgpa.length
      ? (
          validCgpa.reduce((sum, s) => sum + s.cgpa, 0) /
          validCgpa.length
        ).toFixed(2)
      : "0.00";
  }, [mergedStudents]);

  const lowAttendanceCount = useMemo(() => {
    return mergedStudents.filter(
      (student) => student.attendance !== null && student.attendance < 75
    ).length;
  }, [mergedStudents]);

  const highPerformersCount = useMemo(() => {
    return mergedStudents.filter(
      (student) => student.cgpa !== null && student.cgpa >= 8
    ).length;
  }, [mergedStudents]);

  const departmentStats = useMemo(() => {
    const grouped = {};

    mergedStudents.forEach((student) => {
      if (!grouped[student.department]) {
        grouped[student.department] = {
          count: 0,
          attendanceValues: [],
          cgpaValues: []
        };
      }

      grouped[student.department].count += 1;

      if (student.attendance !== null) {
        grouped[student.department].attendanceValues.push(student.attendance);
      }

      if (student.cgpa !== null) {
        grouped[student.department].cgpaValues.push(student.cgpa);
      }
    });

    return Object.entries(grouped)
      .map(([department, data]) => ({
        department,
        totalStudents: data.count,
        avgAttendance: data.attendanceValues.length
          ? (
              data.attendanceValues.reduce((a, b) => a + b, 0) /
              data.attendanceValues.length
            ).toFixed(1)
          : "0.0",
        avgCGPA: data.cgpaValues.length
          ? (
              data.cgpaValues.reduce((a, b) => a + b, 0) /
              data.cgpaValues.length
            ).toFixed(2)
          : "0.00"
      }))
      .sort((a, b) => a.department.localeCompare(b.department));
  }, [mergedStudents]);

  const yearStats = useMemo(() => {
    const grouped = {};

    mergedStudents.forEach((student) => {
      const year = normalizeYear(student.year);

      if (!grouped[year]) {
        grouped[year] = {
          count: 0,
          attendanceValues: [],
          cgpaValues: []
        };
      }

      grouped[year].count += 1;

      if (student.attendance !== null) {
        grouped[year].attendanceValues.push(student.attendance);
      }

      if (student.cgpa !== null) {
        grouped[year].cgpaValues.push(student.cgpa);
      }
    });

    const order = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Unknown"];

    return Object.entries(grouped)
      .map(([year, data]) => ({
        year,
        totalStudents: data.count,
        avgAttendance: data.attendanceValues.length
          ? (
              data.attendanceValues.reduce((a, b) => a + b, 0) /
              data.attendanceValues.length
            ).toFixed(1)
          : "0.0",
        avgCGPA: data.cgpaValues.length
          ? (
              data.cgpaValues.reduce((a, b) => a + b, 0) /
              data.cgpaValues.length
            ).toFixed(2)
          : "0.00"
      }))
      .sort((a, b) => order.indexOf(a.year) - order.indexOf(b.year));
  }, [mergedStudents]);

  return (
    <div style={container}>
      <h2 style={title}>⚙ Admin Dashboard</h2>
      <p style={subtitle}>Manage and monitor system-wide academic performance</p>

      <div style={cardsGrid}>
        <div style={card}>
          <h3 style={value}>{totalStudents}</h3>
          <p style={label}>Total Students</p>
        </div>

        <div style={card}>
          <h3 style={value}>{totalDepartments}</h3>
          <p style={label}>Departments</p>
        </div>

        <div style={card}>
          <h3 style={value}>{avgAttendance}%</h3>
          <p style={label}>Avg Attendance</p>
        </div>

        <div style={card}>
          <h3 style={value}>{avgCGPA}</h3>
          <p style={label}>Avg CGPA</p>
        </div>

        <div style={alertCard}>
          <h3 style={alertValue}>{lowAttendanceCount}</h3>
          <p style={label}>Low Attendance Cases</p>
        </div>

        <div style={successCard}>
          <h3 style={successValue}>{highPerformersCount}</h3>
          <p style={label}>High Performers</p>
        </div>
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>🏢 Department-wise Performance</h3>

        {departmentStats.length === 0 ? (
          <p style={empty}>No department data available ❌</p>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Department</th>
                  <th style={th}>Students</th>
                  <th style={th}>Avg Attendance</th>
                  <th style={th}>Avg CGPA</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept) => (
                  <tr key={dept.department}>
                    <td style={td}>{dept.department}</td>
                    <td style={td}>{dept.totalStudents}</td>
                    <td style={td}>{dept.avgAttendance}%</td>
                    <td style={td}>{dept.avgCGPA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>🎓 Year-wise Performance</h3>

        {yearStats.length === 0 ? (
          <p style={empty}>No year data available ❌</p>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Year</th>
                  <th style={th}>Students</th>
                  <th style={th}>Avg Attendance</th>
                  <th style={th}>Avg CGPA</th>
                </tr>
              </thead>
              <tbody>
                {yearStats.map((year) => (
                  <tr key={year.year}>
                    <td style={td}>{year.year}</td>
                    <td style={td}>{year.totalStudents}</td>
                    <td style={td}>{year.avgAttendance}%</td>
                    <td style={td}>{year.avgCGPA}</td>
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

function getYearFromSemester(semester) {
  const sem = Number(semester);
  if (sem === 1 || sem === 2) return "1st Year";
  if (sem === 3 || sem === 4) return "2nd Year";
  if (sem === 5 || sem === 6) return "3rd Year";
  if (sem === 7 || sem === 8) return "4th Year";
  return "Unknown";
}

function normalizeYear(year) {
  if (!year) return "Unknown";
  const value = String(year).toLowerCase();
  if (value.includes("1")) return "1st Year";
  if (value.includes("2")) return "2nd Year";
  if (value.includes("3")) return "3rd Year";
  if (value.includes("4")) return "4th Year";
  return year;
}

export default AdminDashboard;

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

const card = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const alertCard = {
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

const value = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: "0 0 8px 0"
};

const alertValue = {
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

const label = {
  color: "#cbd5e1",
  fontSize: "15px",
  margin: 0
};

const tableBox = {
  marginTop: "24px",
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "18px",
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

const empty = {
  color: "#f87171",
  fontSize: "15px"
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "700px"
};

const th = {
  padding: "14px 12px",
  textAlign: "left",
  background: "#1e293b",
  color: "#38bdf8",
  fontSize: "14px",
  fontWeight: "700",
  borderBottom: "1px solid #334155"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #1e293b",
  color: "#e2e8f0",
  fontSize: "14px"
};