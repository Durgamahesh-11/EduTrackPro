import { useEffect, useState } from "react";
import API from "../api/api";

function Certifications() {
  const [form, setForm] = useState({
    yearSemester: "",
    activityDetails: "",
    venue: "",
    type: ""
  });

  const [records, setRecords] = useState([]);

  const studentEmail = (localStorage.getItem("userEmail") || "")
    .trim()
    .toLowerCase();

  useEffect(() => {
    const fetchRecords = async () => {
      if (!studentEmail) return;

      try {
        const res = await API.get(`/certifications/${studentEmail}`);
        if (res.data.success) {
          setRecords(res.data.data || []);
        }
      } catch (error) {
        console.log("Fetch certifications error:", error);
      }
    };

    fetchRecords();
  }, [studentEmail]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.yearSemester || !form.activityDetails || !form.venue || !form.type) {
      alert("Please fill all fields ❌");
      return;
    }

    try {
      const res = await API.post("/certifications", {
        studentEmail,
        yearSemester: form.yearSemester,
        activityDetails: form.activityDetails,
        venue: form.venue,
        type: form.type
      });

      alert(res.data.message || "Record added successfully ✅");

      setForm({
        yearSemester: "",
        activityDetails: "",
        venue: "",
        type: ""
      });

      const refresh = await API.get(`/certifications/${studentEmail}`);
      if (refresh.data.success) {
        setRecords(refresh.data.data || []);
      }
    } catch (error) {
      console.log("Add certification error:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to add record ❌");
      }
    }
  };

  return (
    <div style={container}>
      <h2 style={title}>🎓 Certifications / Training / Grooming</h2>
      <p style={subtitle}>
        Add certification programme, training, or grooming session details
      </p>

      <div style={card}>
        <div style={grid}>
          <input
            name="yearSemester"
            placeholder="Year / Semester"
            value={form.yearSemester}
            onChange={handleChange}
            style={input}
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={input}
          >
            <option value="">Select Type</option>
            <option value="Certification">Certification</option>
            <option value="Training">Training</option>
            <option value="Grooming Session">Grooming Session</option>
          </select>

          <input
            name="activityDetails"
            placeholder="Activity Details"
            value={form.activityDetails}
            onChange={handleChange}
            style={input}
          />

          <input
            name="venue"
            placeholder="Venue"
            value={form.venue}
            onChange={handleChange}
            style={input}
          />
        </div>

        <button onClick={handleAdd} style={button}>
          Add Record
        </button>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Saved Records</h3>

        {records.length === 0 ? (
          <p style={empty}>No certification records added yet.</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Year / Sem</th>
                <th style={th}>Type</th>
                <th style={th}>Activity Details</th>
                <th style={th}>Venue</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item, index) => (
                <tr key={item.id || index}>
                  <td style={td}>{item.year_semester}</td>
                  <td style={td}>{item.type}</td>
                  <td style={td}>{item.activity_details}</td>
                  <td style={td}>{item.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Certifications;

const container = {
  padding: "20px",
  color: "#e2e8f0"
};

const title = {
  color: "#38bdf8",
  marginBottom: "8px"
};

const subtitle = {
  color: "#94a3b8",
  marginBottom: "20px"
};

const card = {
  background: "#0f172a",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "15px",
  marginBottom: "15px"
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#e2e8f0",
  outline: "none"
};

const button = {
  padding: "12px 18px",
  background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const sectionTitle = {
  color: "#38bdf8",
  marginBottom: "15px"
};

const empty = {
  color: "#94a3b8"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  padding: "12px",
  textAlign: "left",
  background: "#1e293b",
  color: "#38bdf8"
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #1e293b",
  color: "#e2e8f0"
};