import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

function getGradeFromCGPA(cgpa) {
  const value = getValidNumber(cgpa);

  if (value === null) return "-";
  if (value >= 9.1 && value <= 10) return "O";
  if (value >= 8.1 && value <= 9.0) return "A+";
  if (value >= 7.1 && value <= 8.0) return "A";
  if (value >= 6.1 && value <= 7.0) return "B+";
  if (value >= 5.1 && value <= 6.0) return "B";
  if (value >= 4.1 && value <= 5.0) return "C";
  if (value >= 0 && value <= 4.0) return "F";
  return "-";
}

function getPerformanceFromCGPA(cgpa) {
  const value = getValidNumber(cgpa);
  if (value === null) return null;
  return Number(((value / 10) * 100).toFixed(1));
}

function StudentsTable() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [noteRowIndex, setNoteRowIndex] = useState(null);
  const [manualNote, setManualNote] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/mentor/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error fetching mentor students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const mergedStudents = useMemo(() => {
    return students
      .map((student, index) => {
        const attendance = getValidNumber(student.attendance);
        const cgpa = getValidNumber(student.cgpa);
        const performance = getPerformanceFromCGPA(cgpa);

        return {
          ...student,
          id: student.id || index,
          displayName: student.student_name || student.name || "-",
          displayRollNo: student.roll_no || student.reg_no || "-",
          department: student.department || student.branch || "Unknown",
          section: student.section || "-",
          year: student.year || "-",
          attendance,
          cgpa,
          performance,
          grade:
            student.grade && student.grade !== "-"
              ? student.grade
              : getGradeFromCGPA(cgpa),
          mentor_name: student.mentor_name || "-",
          hod_name: student.hod_name || "-",
          counseling_note: student.counseling_note || ""
        };
      })
      .sort((a, b) => {
        const deptCompare = String(a.department).localeCompare(String(b.department));
        if (deptCompare !== 0) return deptCompare;

        const sectionCompare = String(a.section).localeCompare(String(b.section));
        if (sectionCompare !== 0) return sectionCompare;

        return String(a.displayName).localeCompare(String(b.displayName));
      });
  }, [students]);

  const getAutoSuggestedNote = (student) => {
    const attendance = student.attendance ?? 0;
    const cgpa = student.cgpa ?? 0;

    if (attendance < 75 && cgpa < 6) {
      return "Student has low attendance and low CGPA. Immediate mentoring and regular counseling are required.";
    }

    if (attendance < 75) {
      return "Student attendance is low. Needs regular follow-up and attendance improvement.";
    }

    if (cgpa < 6) {
      return "Student CGPA is below expected level. Needs a stronger academic plan and counseling.";
    }

    return "Student is satisfactory overall, but regular mentor observation is recommended.";
  };

  const handleSaveNote = async (student) => {
    const finalNote = manualNote.trim();

    if (!finalNote) {
      alert("Please enter a note ❌");
      return;
    }

    try {
      await API.put(`/mentor/student-note/${student.id}`, {
        counseling_note: finalNote
      });

      setStudents((prev) =>
        prev.map((item) =>
          item.id === student.id
            ? { ...item, counseling_note: finalNote }
            : item
        )
      );

      setNoteRowIndex(null);
      setManualNote("");
      alert("Note saved successfully ✅");
    } catch (error) {
      console.log("Error saving note:", error);
      alert("Failed to save note ❌");
    }
  };

  const openFullDetails = (student) => {
    const regNo = student.displayRollNo;
    navigate(`/mentor/student/${encodeURIComponent(regNo)}`);
  };

  return (
    <div style={container}>
      <div style={headerRow}>
        <div>
          <h2 style={title}>👥 Students List</h2>
          <p style={subtitle}>
            Click roll number or view button to open full student profile
          </p>
        </div>

        <button style={refreshBtn} onClick={fetchStudents}>
          Refresh
        </button>
      </div>

      <div style={tableBox}>
        {loading ? (
          <p style={empty}>Loading students...</p>
        ) : mergedStudents.length === 0 ? (
          <p style={empty}>No students found ❌</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Roll No</th>
                <th style={th}>Department</th>
                <th style={th}>Section</th>
                <th style={th}>Year</th>
                <th style={th}>Attendance</th>
                <th style={th}>CGPA</th>
                <th style={th}>Grade</th>
                <th style={th}>View</th>
                <th style={th}>Add Note</th>
              </tr>
            </thead>

            <tbody>
              {mergedStudents.map((student, index) => (
                <tr key={student.id || index}>
                  <td style={td}>{student.displayName}</td>

                  <td style={td}>
                    <span style={rollLink} onClick={() => openFullDetails(student)}>
                      {student.displayRollNo}
                    </span>
                  </td>

                  <td style={td}>{student.department}</td>
                  <td style={td}>{student.section}</td>
                  <td style={td}>{student.year}</td>
                  <td style={td}>
                    {student.attendance !== null ? `${student.attendance}%` : "-"}
                  </td>
                  <td style={td}>{student.cgpa !== null ? student.cgpa : "-"}</td>
                  <td style={td}>{student.grade}</td>

                  <td style={td}>
                    <button
                      style={viewBtn}
                      onClick={() => openFullDetails(student)}
                    >
                      Full Details
                    </button>
                  </td>

                  <td style={td}>
                    <button
                      style={noteBtn}
                      onClick={() => {
                        setNoteRowIndex(index);
                        setManualNote(student.counseling_note || "");
                      }}
                    >
                      Add Note
                    </button>

                    {noteRowIndex === index && (
                      <div style={noteOverlay} onClick={() => setNoteRowIndex(null)}>
                        <div style={notePopup} onClick={(e) => e.stopPropagation()}>
                          <h4 style={noteTitle}>Add Note</h4>

                          <textarea
                            placeholder="Enter note manually"
                            value={manualNote}
                            onChange={(e) => setManualNote(e.target.value)}
                            style={noteTextarea}
                            rows={4}
                          />

                          <button
                            style={suggestBtn}
                            onClick={() => setManualNote(getAutoSuggestedNote(student))}
                          >
                            Auto Suggest Note
                          </button>

                          <div style={noteActions}>
                            <button style={saveBtn} onClick={() => handleSaveNote(student)}>
                              Save
                            </button>
                            <button
                              style={cancelBtn}
                              onClick={() => {
                                setNoteRowIndex(null);
                                setManualNote("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentsTable;

const container = {
  padding: "20px",
  color: "#e2e8f0"
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "20px"
};

const title = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: 0
};

const subtitle = {
  marginTop: "8px",
  marginBottom: 0,
  color: "#94a3b8"
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

const tableBox = {
  background: "#0f172a",
  padding: "20px",
  borderRadius: "14px",
  overflowX: "auto",
  border: "1px solid #1e293b"
};

const empty = {
  color: "#f87171"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  padding: "12px",
  textAlign: "left",
  background: "#1e293b",
  color: "#38bdf8",
  borderBottom: "1px solid #334155",
  whiteSpace: "nowrap"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #1e293b",
  color: "#e2e8f0",
  verticalAlign: "top"
};

const rollLink = {
  color: "#38bdf8",
  textDecoration: "underline",
  cursor: "pointer",
  fontWeight: "600"
};

const viewBtn = {
  padding: "7px 12px",
  background: "linear-gradient(90deg, #0ea5e9, #2563eb)",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700"
};

const noteBtn = {
  padding: "7px 12px",
  background: "#2563eb",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700"
};

const noteOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const notePopup = {
  background: "#111c34",
  padding: "18px",
  borderRadius: "12px",
  width: "360px",
  maxWidth: "90%",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  border: "1px solid #334155"
};

const noteTitle = {
  color: "#38bdf8",
  marginBottom: "12px"
};

const noteTextarea = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  background: "#1e293b",
  color: "#fff",
  border: "1px solid #334155",
  resize: "vertical",
  boxSizing: "border-box",
  marginBottom: "10px"
};

const suggestBtn = {
  width: "100%",
  padding: "8px 10px",
  background: "linear-gradient(90deg, #7c3aed, #a855f7)",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
  marginBottom: "10px"
};

const noteActions = {
  display: "flex",
  gap: "8px"
};

const saveBtn = {
  flex: 1,
  padding: "8px 10px",
  background: "#22c55e",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600"
};

const cancelBtn = {
  flex: 1,
  padding: "8px 10px",
  background: "#ef4444",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600"
};