import { useEffect, useState } from "react";
import API from "../api/api";

function Activities() {
  const [form, setForm] = useState({
    category: "",
    yearSemester: "",
    topicDetails: "",
    venue: "",
    examName: "",
    examScore: ""
  });

  const [records, setRecords] = useState([]);
  const [examRecords, setExamRecords] = useState([]);

  const studentEmail = (localStorage.getItem("userEmail") || "")
    .trim()
    .toLowerCase();

  useEffect(() => {
    if (!studentEmail) return;

    const fetchData = async () => {
      try {
        const activityRes = await API.get(`/activities/${studentEmail}`);
        if (activityRes.data.success) {
          setRecords(activityRes.data.data || []);
        }

        const examRes = await API.get(`/activities/exam/${studentEmail}`);
        if (examRes.data.success) {
          setExamRecords(examRes.data.data || []);
        }
      } catch (error) {
        console.log("Fetch activities/exams failed:", error);
      }
    };

    fetchData();
  }, [studentEmail]);

  const refreshActivities = async () => {
    try {
      const res = await API.get(`/activities/${studentEmail}`);
      if (res.data.success) {
        setRecords(res.data.data || []);
      }
    } catch (error) {
      console.log("Refresh activities failed:", error);
    }
  };

  const refreshExams = async () => {
    try {
      const res = await API.get(`/activities/exam/${studentEmail}`);
      if (res.data.success) {
        setExamRecords(res.data.data || []);
      }
    } catch (error) {
      console.log("Refresh exams failed:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddActivity = async () => {
    if (!form.category || !form.yearSemester || !form.topicDetails || !form.venue) {
      alert("Please fill all activity fields");
      return;
    }

    try {
      const res = await API.post("/activities", {
        studentEmail,
        category: form.category,
        yearSemester: form.yearSemester,
        topicDetails: form.topicDetails,
        venue: form.venue
      });

      alert(res.data.message || "Activity added successfully ✅");

      setForm((prev) => ({
        ...prev,
        category: "",
        yearSemester: "",
        topicDetails: "",
        venue: ""
      }));

      refreshActivities();
    } catch (error) {
      console.log("Add activity failed:", error);
      alert("Failed to add activity ❌");
    }
  };

  const handleAddExam = async () => {
    if (!form.examName || !form.examScore) {
      alert("Please fill exam details");
      return;
    }

    try {
      const res = await API.post("/activities/exam", {
        studentEmail,
        examName: form.examName,
        examScore: form.examScore
      });

      alert(res.data.message || "Exam record added successfully ✅");

      setForm((prev) => ({
        ...prev,
        examName: "",
        examScore: ""
      }));

      refreshExams();
    } catch (error) {
      console.log("Add exam failed:", error);
      alert("Failed to add exam ❌");
    }
  };

  return (
    <div style={container}>
      <h2 style={title}>⚡ Activities & Competitive Exams</h2>
      <p style={subtitle}>Manage co-curricular, extra-curricular, and exam records</p>

      <div style={card}>
        <h3 style={sectionTitle}>Activities</h3>

        <div style={grid}>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={input}
          >
            <option value="">Select Category</option>
            <option value="Co-Curricular">Co-Curricular</option>
            <option value="Extra-Curricular">Extra-Curricular</option>
          </select>

          <input
            name="yearSemester"
            placeholder="Year / Semester"
            value={form.yearSemester}
            onChange={handleChange}
            style={input}
          />

          <input
            name="topicDetails"
            placeholder="Topic / Activity Details"
            value={form.topicDetails}
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

        <button onClick={handleAddActivity} style={button}>Add Activity</button>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Competitive Exams</h3>

        <div style={grid}>
          <select
            name="examName"
            value={form.examName}
            onChange={handleChange}
            style={input}
          >
            <option value="">Select Exam</option>
            <option value="GATE">GATE</option>
            <option value="GRE">GRE</option>
            <option value="TOEFL">TOEFL</option>
            <option value="IELTS">IELTS</option>
            <option value="CAT">CAT</option>
            <option value="GMAT">GMAT</option>
          </select>

          <input
            name="examScore"
            placeholder="Year / Marks Secured"
            value={form.examScore}
            onChange={handleChange}
            style={input}
          />
        </div>

        <button onClick={handleAddExam} style={button}>Add Exam Record</button>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Saved Activities</h3>

        {records.length === 0 ? (
          <p style={empty}>No activities added yet.</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Category</th>
                <th style={th}>Year / Sem</th>
                <th style={th}>Topic Details</th>
                <th style={th}>Venue</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item, index) => (
                <tr key={item.id || index}>
                  <td style={td}>{item.category}</td>
                  <td style={td}>{item.year_semester}</td>
                  <td style={td}>{item.topic_details}</td>
                  <td style={td}>{item.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Saved Competitive Exams</h3>

        {examRecords.length === 0 ? (
          <p style={empty}>No competitive exam records added yet.</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Exam Name</th>
                <th style={th}>Year / Marks Secured</th>
              </tr>
            </thead>
            <tbody>
              {examRecords.map((item, index) => (
                <tr key={item.id || index}>
                  <td style={td}>{item.exam_name}</td>
                  <td style={td}>{item.exam_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Activities;

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

const sectionTitle = {
  color: "#38bdf8",
  marginBottom: "15px"
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