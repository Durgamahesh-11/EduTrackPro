import { useEffect, useState } from "react";
import API from "../api/api";

function Counseling() {
  const [form, setForm] = useState({
    counselorName: "",
    department: "",
    notes: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCounseling = async () => {
      const currentEmail = (localStorage.getItem("userEmail") || "").trim().toLowerCase();
      if (!currentEmail) return;

      try {
        const res = await API.get(`/counseling/${currentEmail}`);

        if (res.data.success && res.data.data) {
          setForm({
            counselorName: res.data.data.counselor_name || "",
            department: res.data.data.department || "",
            notes: res.data.data.notes || ""
          });
        }
      } catch (error) {
        console.log("Fetch counseling failed:", error);
      }
    };

    fetchCounseling();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const currentEmail = (localStorage.getItem("userEmail") || "").trim().toLowerCase();

    if (!form.counselorName || !form.department || !form.notes) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const res = await API.post("/counseling", {
        studentEmail: currentEmail,
        counselorName: form.counselorName,
        department: form.department,
        notes: form.notes
      });

      setMessage(res.data.message || "Counseling details saved successfully ✅");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log("Save counseling failed:", error);
      setMessage("Failed to save counseling details ❌");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  return (
    <div style={container}>
      <h2 style={title}>Counseling Notes</h2>

      <input
        type="text"
        name="counselorName"
        placeholder="Counselor Name"
        value={form.counselorName}
        onChange={handleChange}
        style={input}
      />

      <input
        type="text"
        name="department"
        placeholder="Department"
        value={form.department}
        onChange={handleChange}
        style={input}
      />

      <textarea
        name="notes"
        placeholder="Write Counseling Notes..."
        rows="6"
        value={form.notes}
        onChange={handleChange}
        style={textarea}
      />

      <button onClick={handleSave} style={button}>
        Save
      </button>

      {message && <p style={messageStyle}>{message}</p>}
    </div>
  );
}

export default Counseling;

const container = {
  padding: "20px",
  color: "#ffffff",
  maxWidth: "900px"
};

const title = {
  fontSize: "22px",
  marginBottom: "25px",
  color: "#38bdf8",
  fontWeight: "bold"
};

const input = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "24px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#ffffff",
  outline: "none",
  fontSize: "16px"
};

const textarea = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "24px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#ffffff",
  outline: "none",
  fontSize: "16px",
  resize: "vertical"
};

const button = {
  padding: "12px 20px",
  background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px"
};

const messageStyle = {
  marginTop: "15px",
  color: "#22c55e",
  fontWeight: "600"
};