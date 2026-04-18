import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { gradientBg, glass } from "../styles/theme";

function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ ...container, background: gradientBg }}>

      {/* NAVBAR */}
      <div style={navbar}>
        <h2 style={logo}>EduTrackPro</h2>

        <div>
          <button style={navBtn} onClick={() => scrollTo(featuresRef)}>Features</button>
          <button style={navBtn} onClick={() => scrollTo(aboutRef)}>About</button>
          <button style={loginBtn} onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>

      {/* HERO */}
      <div style={hero}>
        <h1 style={title}>Smart Student Management System</h1>
        <p style={subtitle}>
          Track performance, attendance & counseling with powerful insights.
        </p>

        <button style={ctaBtn} onClick={() => navigate("/login")}>
          Get Started
        </button>
      </div>

      {/* FEATURES */}
      <div style={section} ref={featuresRef}>
        <h2 style={sectionTitle}>Features</h2>

        <div style={grid}>
  {[
          {
            title: "Performance Tracking",
            desc: "Monitor academic progress with detailed insights and performance analysis."
          },
          {
            title: "Attendance Monitoring",
            desc: "Track attendance efficiently with real-time updates and automated records."
          },
          {
            title: "Counseling Support",
            desc: "Enhance student guidance through structured counseling and progress tracking."
          },
          {
            title: "Analytics Dashboard",
            desc: "Visualize key metrics with interactive dashboards for smarter decisions."
          }
        ].map((item, i) => (
          <div key={i} style={{ ...card, ...glass }}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
      </div>

      {/* ABOUT */}
      <div style={section} ref={aboutRef}>
        <h2 style={sectionTitle}>About</h2>
        <p style={about}>
          EduTrackPro helps institutions manage students efficiently with real-time data,
          insights, and analytics for better decision-making.
        </p>
      </div>

      {/* FOOTER */}
      <div style={footer}>
        © 2026 EduTrackPro | Built for Academic Excellence
      </div>
    </div>
  );
}

export default LandingPage;

/* STYLES */

const container = {
  minHeight: "100vh",
  color: "white",
  fontFamily: "sans-serif"
};

const navbar = {
  position: "sticky",
  top: 0,
  display: "flex",
  justifyContent: "space-between",
  padding: "20px 40px",
  background: "rgba(0,0,0,0.3)",
  backdropFilter: "blur(10px)"
};

const logo = { fontWeight: "bold" };

const navBtn = {
  marginRight: "15px",
  background: "transparent",
  border: "none",
  color: "white",
  cursor: "pointer"
};

const loginBtn = {
  padding: "8px 15px",
  background: "#3b82f6",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};

const hero = {
  textAlign: "center",
  padding: "100px 20px"
};

const title = { fontSize: "45px" };

const subtitle = {
  marginTop: "10px",
  color: "#cbd5f5"
};

const ctaBtn = {
  marginTop: "20px",
  padding: "12px 25px",
  background: "#22c55e",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};

const section = {
  padding: "60px 40px"
};

const sectionTitle = {
  textAlign: "center",
  marginBottom: "30px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px"
};

const card = {
  padding: "20px",
  transition: "0.3s"
};

const about = {
  maxWidth: "700px",
  margin: "auto",
  textAlign: "center",
  color: "#cbd5f5"
};

const footer = {
  textAlign: "center",
  padding: "20px",
  opacity: 0.7
};