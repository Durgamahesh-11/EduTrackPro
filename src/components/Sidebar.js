import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const role = (localStorage.getItem("role") || "").trim().toLowerCase();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/students") {
      return (
        location.pathname === "/students" ||
        location.pathname.startsWith("/mentor/student/")
      );
    }

    if (path === "/admin-students") {
      return (
        location.pathname === "/admin-students" ||
        location.pathname.startsWith("/admin/student/")
      );
    }

    return location.pathname === path;
  };

  const studentAlertCount = () => {
    if (role !== "student") return 0;

    const attendance = Number(localStorage.getItem("attendance") || 0);
    const cgpa = Number(localStorage.getItem("cgpa") || 0);

    let count = 0;
    if (attendance > 0 && attendance < 75) count += 1;
    if (cgpa > 0 && cgpa < 6) count += 1;
    return count;
  };

  const alertCount = studentAlertCount();

  return (
    <div style={sidebar}>
      <h2 style={logo}>EduTrackPro</h2>

      <div style={menu}>
        {role === "student" && (
          <>
            <NavItem to="/dashboard" label="🏠 Dashboard" active={isActive("/dashboard")} />
            <NavItem to="/student-record" label="👤 My Profile" active={isActive("/student-record")} />
            <NavItem to="/attendance" label="📊 Attendance" active={isActive("/attendance")} />
            <NavItem to="/academics" label="📚 Academics" active={isActive("/academics")} />
            <NavItem to="/performance" label="📈 Performance" active={isActive("/performance")} />
            <NavItem to="/counseling" label="💬 Counseling" active={isActive("/counseling")} />
            <NavItem to="/certifications" label="🎓 Certifications" active={isActive("/certifications")} />
            <NavItem to="/activities" label="⚡ Activities" active={isActive("/activities")} />
            <NavItem to="/projects" label="💻 Projects" active={isActive("/projects")} />
            <NavItem
              to="/student-alerts"
              label="🚨 Alerts"
              active={isActive("/student-alerts")}
              badge={alertCount > 0 ? String(alertCount) : ""}
            />
          </>
        )}

        {role === "mentor" && (
          <>
            <NavItem to="/mentor" label="🏠 Dashboard" active={isActive("/mentor")} />
            <NavItem to="/students" label="👥 Students List" active={isActive("/students")} />
            <NavItem to="/alerts" label="🚨 Alerts" active={isActive("/alerts")} />
          </>
        )}

        {role === "hod" && (
          <>
            <NavItem to="/hod" label="🏠 Dashboard" active={isActive("/hod")} />
            <NavItem to="/hod-students" label="👥 Department Students" active={isActive("/hod-students")} />
            <NavItem to="/hod-attendance" label="📊 Attendance Overview" active={isActive("/hod-attendance")} />
            <NavItem to="/hod-performance" label="📈 Performance Overview" active={isActive("/hod-performance")} />
            <NavItem to="/hod-analytics" label="📑 Department Analytics" active={isActive("/hod-analytics")} />
            <NavItem to="/hod-alerts" label="🚨 Department Alerts" active={isActive("/hod-alerts")} />
          </>
        )}

        {role === "admin" && (
          <>
            <NavItem to="/admin" label="🏠 Dashboard" active={isActive("/admin")} />
            <NavItem to="/admin-students" label="👥 All Students" active={isActive("/admin-students")} />
            <NavItem to="/admin-departments" label="🏢 Department Overview" active={isActive("/admin-departments")} />
            <NavItem to="/admin-performance" label="📈 Performance Reports" active={isActive("/admin-performance")} />
            <NavItem to="/admin-attendance" label="📊 Attendance Reports" active={isActive("/admin-attendance")} />
            <NavItem to="/admin-counseling" label="💬 Counseling Reports" active={isActive("/admin-counseling")} />
            <NavItem to="/admin-users" label="🛠 User Management" active={isActive("/admin-users")} />
          </>
        )}
      </div>
    </div>
  );
}

function NavItem({ to, label, active, badge }) {
  return (
    <Link
      to={to}
      style={{
        ...navItem,
        background: active
          ? "linear-gradient(90deg, #3b82f6, #06b6d4)"
          : "rgba(255,255,255,0.03)",
        color: active ? "#ffffff" : "#cbd5e1",
        transform: active ? "scale(1.02)" : "scale(1)",
        boxShadow: active
          ? "0 8px 18px rgba(59,130,246,0.25)"
          : "none"
      }}
    >
      <span>{label}</span>
      {badge ? <span style={badgeStyle}>{badge}</span> : null}
    </Link>
  );
}

const sidebar = {
  width: "260px",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #020617, #0f172a, #1e293b)",
  color: "#ffffff",
  padding: "22px 18px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "4px 0 20px rgba(0,0,0,0.35)",
  borderRight: "1px solid rgba(148, 163, 184, 0.12)"
};

const logo = {
  textAlign: "center",
  marginBottom: "28px",
  fontWeight: "800",
  fontSize: "24px",
  letterSpacing: "0.8px",
  background: "linear-gradient(90deg, #38bdf8, #6366f1)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const menu = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const navItem = {
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "600",
  transition: "0.25s ease",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  border: "1px solid rgba(148, 163, 184, 0.08)"
};

const badgeStyle = {
  minWidth: "22px",
  height: "22px",
  borderRadius: "999px",
  background: "#ef4444",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "800",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 6px 14px rgba(239,68,68,0.3)"
};

export default Sidebar;