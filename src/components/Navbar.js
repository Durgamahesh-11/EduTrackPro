import { useNavigate, useLocation } from "react-router-dom";

function Navbar({ setRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  const role = (localStorage.getItem("role") || "").trim().toLowerCase();
  const userEmail = localStorage.getItem("userEmail") || "";

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");

    if (setRole) setRole("");
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/dashboard") return "Student Dashboard";
    if (path === "/student-record") return "Student Profile";
    if (path === "/attendance") return "Attendance";
    if (path === "/academics") return "Academics";
    if (path === "/performance") return "Performance";
    if (path === "/student-alerts") return "Student Alerts";
    if (path === "/counseling") return "Counseling";
    if (path === "/certifications") return "Certifications";
    if (path === "/activities") return "Activities";
    if (path === "/projects") return "Projects";

    if (path === "/mentor") return "Mentor Dashboard";
    if (path === "/students") return "Students List";
    if (path === "/alerts") return "Mentor Alerts";

    if (path === "/hod") return "HOD Dashboard";
    if (path === "/hod-students") return "Department Students";
    if (path === "/hod-attendance") return "Attendance Overview";
    if (path === "/hod-performance") return "Performance Overview";
    if (path === "/hod-analytics") return "Department Analytics";
    if (path === "/hod-alerts") return "Department Alerts";

    if (path === "/admin") return "Admin Dashboard";
    if (path === "/admin-students") return "All Students";
    if (path === "/admin-departments") return "Department Overview";
    if (path === "/admin-performance") return "Performance Reports";
    if (path === "/admin-attendance") return "Attendance Reports";
    if (path === "/admin-counseling") return "Counseling Reports";
    if (path === "/admin-users") return "User Management";

    if (path.startsWith("/admin/student/")) return "Student Details";
    if (path.startsWith("/mentor/student/")) return "Student Details";

    return "Dashboard";
  };

  const getRoleLabel = () => {
    if (!role) return "USER";
    if (role === "hod") return "HOD";
    return role.toUpperCase();
  };

  return (
    <div style={navbar}>
      <div style={leftSection}>
        <h3 style={title}>{getPageTitle()}</h3>
        <p style={subtitle}>EduTrackPro Management System</p>
      </div>

      <div style={rightSection}>
        <div style={userBox}>
          <div style={avatar}>
            {role ? role.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <div style={roleText}>{getRoleLabel()}</div>
            <div style={emailText}>{userEmail || "No Email"}</div>
          </div>
        </div>

        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;

const navbar = {
  minHeight: "72px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 22px",
  background: "rgba(15, 23, 42, 0.78)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
  color: "#ffffff",
  position: "sticky",
  top: 0,
  zIndex: 50
};

const leftSection = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const title = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "800",
  color: "#f8fafc"
};

const subtitle = {
  margin: 0,
  fontSize: "13px",
  color: "#94a3b8"
};

const rightSection = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap"
};

const userBox = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 12px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(148, 163, 184, 0.12)"
};

const avatar = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "800",
  color: "#ffffff",
  fontSize: "16px",
  boxShadow: "0 8px 18px rgba(59,130,246,0.25)"
};

const roleText = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#e2e8f0",
  lineHeight: "1.2"
};

const emailText = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "2px"
};

const logoutBtn = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "13px",
  boxShadow: "0 8px 18px rgba(239,68,68,0.25)"
};