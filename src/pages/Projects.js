import { useEffect, useState } from "react";
import API from "../api/api";

function Projects() {
  const [miniProject, setMiniProject] = useState({
    title: "",
    guide: "",
    organization: ""
  });

  const [majorProject, setMajorProject] = useState({
    title: "",
    guide: "",
    organization: ""
  });

  const studentEmail = (localStorage.getItem("userEmail") || "")
    .trim()
    .toLowerCase();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!studentEmail) return;

      try {
        const res = await API.get(`/projects/${studentEmail}`);

        if (res.data.success && res.data.data) {
          const data = res.data.data;

          setMiniProject({
            title: data.mini_title || "",
            guide: data.mini_guide || "",
            organization: data.mini_organization || ""
          });

          setMajorProject({
            title: data.major_title || "",
            guide: data.major_guide || "",
            organization: data.major_organization || ""
          });
        }
      } catch (error) {
        console.log("Fetch projects failed:", error);
      }
    };

    fetchProjects();
  }, [studentEmail]);

  const handleMiniChange = (e) => {
    setMiniProject({ ...miniProject, [e.target.name]: e.target.value });
  };

  const handleMajorChange = (e) => {
    setMajorProject({ ...majorProject, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await API.post("/projects", {
        studentEmail,
        miniProject,
        majorProject
      });

      alert(res.data.message || "Projects saved successfully ✅");
    } catch (error) {
      console.log("Save projects failed:", error);
      alert("Failed to save projects ❌");
    }
  };

  return (
    <div style={container}>
      <h2 style={title}>💻 Projects</h2>
      <p style={subtitle}>Add 3rd Year Mini Project and 4th Year Project details</p>

      <div style={card}>
        <h3 style={sectionTitle}>3rd Year Mini Project</h3>
        <div style={grid}>
          <input
            name="title"
            placeholder="Project Title"
            value={miniProject.title}
            onChange={handleMiniChange}
            style={input}
          />
          <input
            name="guide"
            placeholder="Internal Guide Name"
            value={miniProject.guide}
            onChange={handleMiniChange}
            style={input}
          />
          <input
            name="organization"
            placeholder="Organization Address"
            value={miniProject.organization}
            onChange={handleMiniChange}
            style={input}
          />
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>4th Year Project</h3>
        <div style={grid}>
          <input
            name="title"
            placeholder="Project Title"
            value={majorProject.title}
            onChange={handleMajorChange}
            style={input}
          />
          <input
            name="guide"
            placeholder="Internal Guide Name"
            value={majorProject.guide}
            onChange={handleMajorChange}
            style={input}
          />
          <input
            name="organization"
            placeholder="Organization Address"
            value={majorProject.organization}
            onChange={handleMajorChange}
            style={input}
          />
        </div>
      </div>

      <button onClick={handleSave} style={button}>Save Projects</button>
    </div>
  );
}

export default Projects;

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
  gridTemplateColumns: "1fr",
  gap: "15px"
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