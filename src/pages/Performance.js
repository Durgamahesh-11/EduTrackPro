import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

const semesters = [
  { key: "11", label: "I Year - I Semester" },
  { key: "12", label: "I Year - II Semester" },
  { key: "21", label: "II Year - I Semester" },
  { key: "22", label: "II Year - II Semester" },
  { key: "31", label: "III Year - I Semester" },
  { key: "32", label: "III Year - II Semester" },
  { key: "41", label: "IV Year - I Semester" },
  { key: "42", label: "IV Year - II Semester" }
];

const monthKeys = ["month1", "month2", "month3", "month4", "month5"];
const monthLabels = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5"];
const defaultRowCount = 8;

const createSubjects = () =>
  Array.from({ length: defaultRowCount }, () => ({
    subjectCode: "",
    subjectName: "",
    attendance: {
      month1: "",
      month2: "",
      month3: "",
      month4: "",
      month5: ""
    },
    cie1: "",
    cie2: "",
    viva: "",
    finalGrade: ""
  }));

const createInitialState = () => {
  const state = {};
  semesters.forEach((sem) => {
    state[sem.key] = {
      subjects: createSubjects(),
      percentage: "",
      sgpa: "",
      cgpa: ""
    };
  });
  return state;
};

const parseNum = (value) => {
  const num = parseFloat(value);
  return Number.isNaN(num) ? 0 : num;
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

const isEmptyValue = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const parseOptionalNumber = (value) => {
  if (isEmptyValue(value)) return null;
  const num = parseFloat(value);
  return Number.isNaN(num) ? null : num;
};

const isSubjectFilled = (subject) => {
  return (
    subject.subjectCode.trim() !== "" ||
    subject.subjectName.trim() !== "" ||
    monthKeys.some((month) => String(subject.attendance[month]).trim() !== "") ||
    String(subject.cie1).trim() !== "" ||
    String(subject.cie2).trim() !== "" ||
    String(subject.viva).trim() !== "" ||
    String(subject.finalGrade).trim() !== ""
  );
};

function Performance() {
  const [selectedSem, setSelectedSem] = useState("11");
  const [performance, setPerformance] = useState(createInitialState());
  const currentEmail = (localStorage.getItem("userEmail") || "").trim().toLowerCase();

  useEffect(() => {
    if (!currentEmail) return;

    const fetchPerformance = async () => {
      try {
        const res = await API.get(`/performance/${currentEmail}`);

        if (res.data.success && res.data.data) {
          const updatedPerformance = createInitialState();

          Object.keys(updatedPerformance).forEach((semKey) => {
            if (res.data.data[semKey]) {
              updatedPerformance[semKey] = {
                subjects: Array.isArray(res.data.data[semKey].subjects)
                  ? res.data.data[semKey].subjects.map((subject) => ({
                      ...createSubjects()[0],
                      ...subject,
                      attendance: {
                        month1: "",
                        month2: "",
                        month3: "",
                        month4: "",
                        month5: "",
                        ...(subject.attendance || {})
                      }
                    }))
                  : createSubjects(),
                percentage: res.data.data[semKey].percentage || "",
                sgpa: res.data.data[semKey].sgpa || "",
                cgpa: res.data.data[semKey].cgpa || ""
              };
            }
          });

          setPerformance(updatedPerformance);
        } else {
          setPerformance(createInitialState());
        }
      } catch (error) {
        console.log("Fetch performance failed:", error);
      }
    };

    fetchPerformance();
  }, [currentEmail]);

  const currentSem = performance[selectedSem];

  const handleSubjectChange = (index, field, value) => {
    setPerformance((prev) => {
      const updated = { ...prev };
      updated[selectedSem] = { ...updated[selectedSem] };
      updated[selectedSem].subjects = [...updated[selectedSem].subjects];
      updated[selectedSem].subjects[index] = {
        ...updated[selectedSem].subjects[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleAttendanceChange = (index, monthKey, value) => {
    setPerformance((prev) => {
      const updated = { ...prev };
      updated[selectedSem] = { ...updated[selectedSem] };
      updated[selectedSem].subjects = [...updated[selectedSem].subjects];
      updated[selectedSem].subjects[index] = {
        ...updated[selectedSem].subjects[index],
        attendance: {
          ...updated[selectedSem].subjects[index].attendance,
          [monthKey]: value
        }
      };
      return updated;
    });
  };

  const handlePercentageChange = (value) => {
    setPerformance((prev) => ({
      ...prev,
      [selectedSem]: {
        ...prev[selectedSem],
        percentage: value
      }
    }));
  };

  const handleSgpaChange = (value) => {
    setPerformance((prev) => ({
      ...prev,
      [selectedSem]: {
        ...prev[selectedSem],
        sgpa: value
      }
    }));
  };

  const handleCgpaChange = (value) => {
    setPerformance((prev) => ({
      ...prev,
      [selectedSem]: {
        ...prev[selectedSem],
        cgpa: value
      }
    }));
  };

  const calculated = useMemo(() => {
    const filledSubjects = currentSem.subjects.filter(isSubjectFilled);

    const monthTotals = {
      month1: 0,
      month2: 0,
      month3: 0,
      month4: 0,
      month5: 0
    };

    const monthCounts = {
      month1: 0,
      month2: 0,
      month3: 0,
      month4: 0,
      month5: 0
    };

    const totals = filledSubjects.reduce(
      (acc, subject) => {
        const cie1 = parseNum(subject.cie1);
        const cie2 = parseNum(subject.cie2);
        const viva = parseNum(subject.viva);
        const cieAvg = (cie1 + cie2) / 2 + viva;

        acc.cie1 += cie1;
        acc.cie2 += cie2;
        acc.cieAvg += cieAvg;

        monthKeys.forEach((month) => {
          if (String(subject.attendance[month]).trim() !== "") {
            monthTotals[month] += parseNum(subject.attendance[month]);
            monthCounts[month] += 1;
          }
        });

        return acc;
      },
      { cie1: 0, cie2: 0, cieAvg: 0 }
    );

    const monthlyAttendanceAverage = {};
    monthKeys.forEach((month) => {
      monthlyAttendanceAverage[month] =
        monthCounts[month] > 0 ? monthTotals[month] / monthCounts[month] : 0;
    });

    const validMonthlyAverages = monthKeys
      .map((month) => monthlyAttendanceAverage[month])
      .filter((value, index) => monthCounts[monthKeys[index]] > 0);

    const semesterAttendanceAverage =
      validMonthlyAverages.length > 0
        ? validMonthlyAverages.reduce((sum, value) => sum + value, 0) /
          validMonthlyAverages.length
        : 0;

    return {
      ...totals,
      monthlyAttendanceAverage,
      semesterAttendanceAverage
    };
  }, [currentSem]);

  const handleSave = async () => {
    if (!currentEmail) {
      alert("User email not found. Please login again.");
      return;
    }

    const semData = performance[selectedSem];

    try {
      const res = await API.post("/performance", {
        studentEmail: currentEmail,
        selectedSem,
        semData,
        semesterAttendance: formatNumber(calculated.semesterAttendanceAverage)
      });

      const attendance = Number(calculated.semesterAttendanceAverage || 0);
      const percentageParsed = parseOptionalNumber(semData.percentage);
      const sgpaParsed = parseOptionalNumber(semData.sgpa);
      const cgpaParsed = parseOptionalNumber(semData.cgpa);

      const percentage = percentageParsed === null ? "-" : percentageParsed;
      const sgpa = sgpaParsed === null ? "-" : sgpaParsed;
      const cgpa = cgpaParsed === null ? "-" : cgpaParsed;

      const dashboardData = {
        studentEmail: currentEmail,
        selectedSem,
        semesterLabel:
          semesters.find((sem) => sem.key === selectedSem)?.label || "",
        attendance,
        percentage,
        sgpa,
        cgpa
      };

      const existingDashboardData =
        JSON.parse(localStorage.getItem("performanceData")) || [];

      const existingIndex = existingDashboardData.findIndex(
        (item) => (item.studentEmail || "").trim().toLowerCase() === currentEmail
      );

      if (existingIndex !== -1) {
        existingDashboardData[existingIndex] = dashboardData;
      } else {
        existingDashboardData.push(dashboardData);
      }

      localStorage.setItem("performanceData", JSON.stringify(existingDashboardData));

      alert(res.data.message || "Performance Record Saved Successfully ✅");
    } catch (error) {
      console.log("Save performance failed:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Performance save failed ❌");
      }
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={heading}>PERFORMANCE RECORD</h2>

        <div style={dropdownRow}>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            style={dropdown}
          >
            {semesters.map((sem) => (
              <option key={sem.key} value={sem.key}>
                {sem.label}
              </option>
            ))}
          </select>
        </div>

        <div style={semesterTitle}>
          {semesters.find((s) => s.key === selectedSem)?.label}
        </div>

        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...th, minWidth: "70px" }} rowSpan="2">S. No</th>
                <th style={{ ...th, minWidth: "140px" }} rowSpan="2">Subject Code</th>
                <th style={{ ...th, minWidth: "210px" }} rowSpan="2">Subject Name</th>
                <th style={th} colSpan="5">(%) Attendance - Month (Specify)</th>
                <th style={th} colSpan="4">CIE Exam Marks</th>
                <th style={{ ...th, minWidth: "120px" }} rowSpan="2">Final Grade</th>
              </tr>
              <tr>
                {monthLabels.map((label) => (
                  <th key={label} style={{ ...th, minWidth: "110px" }}>{label}</th>
                ))}
                <th style={{ ...th, minWidth: "110px" }}>CIE-I (35)</th>
                <th style={{ ...th, minWidth: "110px" }}>CIE-II (35)</th>
                <th style={{ ...th, minWidth: "110px" }}>VIVA (5)</th>
                <th style={{ ...th, minWidth: "120px" }}>CIE Avg. (40)</th>
              </tr>
            </thead>

            <tbody>
              {currentSem.subjects.map((subject, index) => {
                const cie1 = parseNum(subject.cie1);
                const cie2 = parseNum(subject.cie2);
                const viva = parseNum(subject.viva);
                const cieAvg = (cie1 + cie2) / 2 + viva;

                return (
                  <tr key={index}>
                    <td style={serialTd}>{index + 1}</td>

                    <td style={td}>
                      <input
                        type="text"
                        value={subject.subjectCode}
                        onChange={(e) =>
                          handleSubjectChange(index, "subjectCode", e.target.value)
                        }
                        placeholder="Code"
                        style={input}
                      />
                    </td>

                    <td style={td}>
                      <input
                        type="text"
                        value={subject.subjectName}
                        onChange={(e) =>
                          handleSubjectChange(index, "subjectName", e.target.value)
                        }
                        placeholder="Subject Name"
                        style={input}
                      />
                    </td>

                    {monthKeys.map((monthKey) => (
                      <td key={monthKey} style={td}>
                        <input
                          type="text"
                          value={subject.attendance[monthKey]}
                          onChange={(e) =>
                            handleAttendanceChange(index, monthKey, e.target.value)
                          }
                          placeholder="%"
                          style={input}
                        />
                      </td>
                    ))}

                    <td style={td}>
                      <input
                        type="text"
                        value={subject.cie1}
                        onChange={(e) =>
                          handleSubjectChange(index, "cie1", e.target.value)
                        }
                        placeholder="Marks"
                        style={input}
                      />
                    </td>

                    <td style={td}>
                      <input
                        type="text"
                        value={subject.cie2}
                        onChange={(e) =>
                          handleSubjectChange(index, "cie2", e.target.value)
                        }
                        placeholder="Marks"
                        style={input}
                      />
                    </td>

                    <td style={td}>
                      <input
                        type="text"
                        value={subject.viva}
                        onChange={(e) =>
                          handleSubjectChange(index, "viva", e.target.value)
                        }
                        placeholder="Marks"
                        style={input}
                      />
                    </td>

                    <td style={td}>
                      <input
                        type="text"
                        value={
                          subject.cie1 || subject.cie2 || subject.viva
                            ? formatNumber(cieAvg)
                            : ""
                        }
                        placeholder="Marks"
                        style={readOnlyInput}
                        readOnly
                      />
                    </td>

                    <td style={td}>
                      <input
                        type="text"
                        value={subject.finalGrade}
                        onChange={(e) =>
                          handleSubjectChange(index, "finalGrade", e.target.value)
                        }
                        placeholder="Grade"
                        style={input}
                      />
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td style={summaryHead} colSpan="3">Cumulative Monthly Attendance %</td>
                {monthKeys.map((monthKey) => (
                  <td key={monthKey} style={summaryValueTd}>
                    <input
                      type="text"
                      value={formatNumber(calculated.monthlyAttendanceAverage[monthKey])}
                      style={readOnlyInput}
                      readOnly
                    />
                  </td>
                ))}
                <td style={summaryHead}>Grand CIE-I</td>
                <td style={summaryValueTd}>
                  <input
                    type="text"
                    value={formatNumber(calculated.cie1)}
                    style={readOnlyInput}
                    readOnly
                  />
                </td>
                <td style={summaryHead}>Grand CIE-II</td>
                <td style={summaryValueTd}>
                  <input
                    type="text"
                    value={formatNumber(calculated.cie2)}
                    style={readOnlyInput}
                    readOnly
                  />
                </td>
                <td style={summaryHead}>Grand CIE Avg</td>
                <td style={summaryValueTd}>
                  <input
                    type="text"
                    value={formatNumber(calculated.cieAvg)}
                    style={readOnlyInput}
                    readOnly
                  />
                </td>
                <td style={summaryHead}></td>
              </tr>

              <tr>
                <td style={summaryHead} colSpan="3">Cumulative Semester Attendance %</td>
                <td style={summaryWideTd} colSpan="5">
                  <input
                    type="text"
                    value={formatNumber(calculated.semesterAttendanceAverage)}
                    style={wideInput}
                    readOnly
                  />
                </td>

                <td style={summaryHead}>(%) Marks</td>
                <td style={summaryWideTd}>
                  <input
                    type="text"
                    value={currentSem.percentage}
                    onChange={(e) => handlePercentageChange(e.target.value)}
                    placeholder="Enter % marks"
                    style={wideInput}
                  />
                </td>

                <td style={summaryHead}>SGPA</td>
                <td style={summaryWideTd}>
                  <input
                    type="text"
                    value={currentSem.sgpa}
                    onChange={(e) => handleSgpaChange(e.target.value)}
                    placeholder="Enter SGPA"
                    style={wideInput}
                  />
                </td>

                <td style={summaryHead}>CGPA</td>
                <td style={summaryWideTd}>
                  <input
                    type="text"
                    value={currentSem.cgpa}
                    onChange={(e) => handleCgpaChange(e.target.value)}
                    placeholder="Enter CGPA"
                    style={wideInput}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={handleSave} style={button}>
        Save Performance Record
      </button>
    </div>
  );
}

export default Performance;

const container = { padding: "20px", color: "#e2e8f0" };
const card = {
  background: "#0b1730",
  padding: "18px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.28)"
};
const heading = {
  color: "#32c5ff",
  textAlign: "center",
  fontSize: "30px",
  marginBottom: "18px",
  letterSpacing: "0.5px",
  fontWeight: "800"
};
const dropdownRow = { marginBottom: "14px" };
const dropdown = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#1d2b44",
  color: "#ffffff",
  outline: "none",
  fontSize: "16px",
  fontWeight: "600"
};
const semesterTitle = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  marginBottom: "12px"
};
const tableWrapper = { overflowX: "auto", borderRadius: "12px" };
const table = {
  width: "100%",
  minWidth: "1700px",
  borderCollapse: "collapse",
  background: "#0e1a33",
  borderRadius: "12px",
  overflow: "hidden"
};
const th = {
  padding: "12px 10px",
  textAlign: "center",
  background: "#1f2d46",
  color: "#32c5ff",
  border: "1px solid #31435f",
  fontWeight: "800",
  fontSize: "14px",
  whiteSpace: "nowrap"
};
const td = {
  padding: "8px",
  border: "1px solid #31435f",
  background: "#0e1a33",
  textAlign: "center",
  verticalAlign: "middle"
};
const serialTd = {
  padding: "8px",
  border: "1px solid #31435f",
  background: "#13203d",
  color: "#ffffff",
  fontWeight: "800",
  textAlign: "center",
  fontSize: "16px"
};
const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #31435f",
  background: "#1c2a44",
  color: "#dbeafe",
  outline: "none",
  textAlign: "center",
  boxSizing: "border-box",
  minHeight: "38px",
  fontSize: "15px"
};
const readOnlyInput = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #31435f",
  background: "#1c2a44",
  color: "#dbeafe",
  outline: "none",
  textAlign: "center",
  boxSizing: "border-box",
  minHeight: "38px",
  fontSize: "15px",
  fontWeight: "700"
};
const wideInput = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #31435f",
  background: "#09162e",
  color: "#dbeafe",
  outline: "none",
  textAlign: "center",
  boxSizing: "border-box",
  minHeight: "38px",
  fontSize: "15px",
  display: "block"
};
const summaryHead = {
  padding: "12px 10px",
  textAlign: "center",
  background: "#15233f",
  color: "#ffffff",
  border: "1px solid #31435f",
  fontWeight: "800",
  fontSize: "14px",
  whiteSpace: "nowrap"
};
const summaryValueTd = {
  padding: "8px",
  border: "1px solid #31435f",
  background: "#0e1a33",
  minWidth: "120px",
  textAlign: "center",
  verticalAlign: "middle"
};
const summaryWideTd = {
  padding: "8px",
  border: "1px solid #31435f",
  background: "#0e1a33",
  minWidth: "120px",
  textAlign: "center",
  verticalAlign: "middle"
};
const button = {
  marginTop: "20px",
  padding: "12px 22px",
  background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px"
};