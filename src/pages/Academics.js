import { useEffect, useState } from "react";
import API from "../api/api";

function Academics() {
  const [academic, setAcademic] = useState({
    percent11: "",
    percent12: "",
    percent21: "",
    percent22: "",
    percent31: "",
    percent32: "",
    percent41: "",
    percent42: "",
    backlog11: "",
    backlog12: "",
    backlog21: "",
    backlog22: "",
    backlog31: "",
    backlog32: "",
    backlog41: "",
    backlog42: "",
    clear11: "",
    clear12: "",
    clear21: "",
    clear22: "",
    clear31: "",
    clear32: "",
    clear41: "",
    clear42: ""
  });

  useEffect(() => {
    const currentEmail = (localStorage.getItem("userEmail") || "")
      .trim()
      .toLowerCase();

    if (!currentEmail) return;

    const fetchAcademic = async () => {
      try {
        const res = await API.get(`/performance/${currentEmail}`);

        if (res.data.success && res.data.data) {
          const data = res.data.data;

          const getBacklog = (sem) => {
            const subjects = data[sem]?.subjects || [];
            const count = subjects.filter(
              (s) => (s.finalGrade || "").trim().toUpperCase() === "F"
            ).length;

            return count > 0 ? String(count) : "-";
          };

          const storedAcademic =
            JSON.parse(localStorage.getItem("academicRecord")) || {};

          setAcademic({
            ...storedAcademic,
            percent11: data["11"]?.percentage || "",
            percent12: data["12"]?.percentage || "",
            percent21: data["21"]?.percentage || "",
            percent22: data["22"]?.percentage || "",
            percent31: data["31"]?.percentage || "",
            percent32: data["32"]?.percentage || "",
            percent41: data["41"]?.percentage || "",
            percent42: data["42"]?.percentage || "",
            backlog11: getBacklog("11"),
            backlog12: getBacklog("12"),
            backlog21: getBacklog("21"),
            backlog22: getBacklog("22"),
            backlog31: getBacklog("31"),
            backlog32: getBacklog("32"),
            backlog41: getBacklog("41"),
            backlog42: getBacklog("42"),
            clear11: storedAcademic.clear11 || "",
            clear12: storedAcademic.clear12 || "",
            clear21: storedAcademic.clear21 || "",
            clear22: storedAcademic.clear22 || "",
            clear31: storedAcademic.clear31 || "",
            clear32: storedAcademic.clear32 || "",
            clear41: storedAcademic.clear41 || "",
            clear42: storedAcademic.clear42 || ""
          });
        }
      } catch (error) {
        console.log("Fetch academic failed:", error);

        const storedAcademic =
          JSON.parse(localStorage.getItem("academicRecord")) || {};

        setAcademic((prev) => ({
          ...prev,
          ...storedAcademic
        }));
      }
    };

    fetchAcademic();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAcademic((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem("academicRecord", JSON.stringify(academic));
    alert("Academic Record Saved Successfully ✅");
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={heading}>ACADEMIC RECORD</h2>
        <p style={subText}>% Marks & Backlogs (if any)</p>

        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Year</th>
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
                <td style={rowHead}>Percentage</td>
                <td style={td}>
                  <input name="percent11" value={academic.percent11} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="percent12" value={academic.percent12} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="percent21" value={academic.percent21} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="percent22" value={academic.percent22} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="percent31" value={academic.percent31} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="percent32" value={academic.percent32} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="percent41" value={academic.percent41} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="percent42" value={academic.percent42} readOnly style={input} />
                </td>
              </tr>

              <tr>
                <td style={rowHead}>No. of Backlogs</td>
                <td style={td}>
                  <input name="backlog11" value={academic.backlog11} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="backlog12" value={academic.backlog12} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="backlog21" value={academic.backlog21} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="backlog22" value={academic.backlog22} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="backlog31" value={academic.backlog31} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="backlog32" value={academic.backlog32} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="backlog41" value={academic.backlog41} readOnly style={input} />
                </td>
                <td style={td}>
                  <input name="backlog42" value={academic.backlog42} readOnly style={input} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ ...subText, marginTop: "24px" }}>
          % of Marks (after clearing the backlogs)
        </p>

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
                <td style={td}>
                  <input name="clear11" value={academic.clear11} onChange={handleChange} style={input} />
                </td>
                <td style={td}>
                  <input name="clear12" value={academic.clear12} onChange={handleChange} style={input} />
                </td>
                <td style={td}>
                  <input name="clear21" value={academic.clear21} onChange={handleChange} style={input} />
                </td>
                <td style={td}>
                  <input name="clear22" value={academic.clear22} onChange={handleChange} style={input} />
                </td>
                <td style={td}>
                  <input name="clear31" value={academic.clear31} onChange={handleChange} style={input} />
                </td>
                <td style={td}>
                  <input name="clear32" value={academic.clear32} onChange={handleChange} style={input} />
                </td>
                <td style={td}>
                  <input name="clear41" value={academic.clear41} onChange={handleChange} style={input} />
                </td>
                <td style={td}>
                  <input name="clear42" value={academic.clear42} onChange={handleChange} style={input} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={handleSave} style={button}>
        Save Academics
      </button>
    </div>
  );
}

export default Academics;

const container = {
  padding: "20px",
  color: "#e2e8f0"
};

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
  marginBottom: "10px",
  letterSpacing: "0.5px"
};

const subText = {
  color: "#cbd5e1",
  fontWeight: "600",
  marginBottom: "14px"
};

const tableWrapper = {
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1080px",
  background: "#111827",
  borderRadius: "10px",
  overflow: "hidden"
};

const th = {
  padding: "14px 10px",
  textAlign: "center",
  background: "#1e293b",
  color: "#38bdf8",
  border: "1px solid #334155",
  fontWeight: "700",
  fontSize: "15px"
};

const rowHead = {
  padding: "14px 10px",
  textAlign: "center",
  background: "#172033",
  color: "#e2e8f0",
  border: "1px solid #334155",
  fontWeight: "700",
  minWidth: "120px"
};

const td = {
  padding: "10px",
  border: "1px solid #334155",
  background: "#0f172a"
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#e2e8f0",
  outline: "none",
  textAlign: "center",
  boxSizing: "border-box"
};

const button = {
  padding: "12px 22px",
  background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};