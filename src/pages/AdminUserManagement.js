import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

function AdminUserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("/admin/users")
      .then((res) => {
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log("Error fetching users:", err);
        setUsers([]);
      });
  }, []);

  const summary = useMemo(() => {
    return {
      totalUsers: users.length,
      totalStudents: users.filter((user) => user.role === "student").length,
      totalMentors: users.filter((user) => user.role === "mentor").length,
      totalHODs: users.filter((user) => user.role === "hod").length,
      totalAdmins: users.filter((user) => user.role === "admin").length
    };
  }, [users]);

  const getRoleBadgeStyle = (role) => {
    const normalizedRole = String(role || "").toLowerCase();

    if (normalizedRole === "admin") {
      return {
        ...roleBadge,
        color: "#f87171",
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.22)"
      };
    }

    if (normalizedRole === "hod") {
      return {
        ...roleBadge,
        color: "#facc15",
        background: "rgba(250,204,21,0.12)",
        border: "1px solid rgba(250,204,21,0.22)"
      };
    }

    if (normalizedRole === "mentor") {
      return {
        ...roleBadge,
        color: "#38bdf8",
        background: "rgba(56,189,248,0.12)",
        border: "1px solid rgba(56,189,248,0.22)"
      };
    }

    return {
      ...roleBadge,
      color: "#4ade80",
      background: "rgba(74,222,128,0.12)",
      border: "1px solid rgba(74,222,128,0.22)"
    };
  };

  return (
    <div style={container}>
      <h2 style={title}>🛠 User Management</h2>
      <p style={subtitle}>
        View and manage users across students, mentors, HODs, and admins
      </p>

      <div style={topCardsGrid}>
        <div style={topCard}>
          <h3 style={topValue}>{summary.totalUsers}</h3>
          <p style={topLabel}>Total Users</p>
        </div>

        <div style={studentCard}>
          <h3 style={studentValue}>{summary.totalStudents}</h3>
          <p style={topLabel}>Students</p>
        </div>

        <div style={mentorCard}>
          <h3 style={mentorValue}>{summary.totalMentors}</h3>
          <p style={topLabel}>Mentors</p>
        </div>

        <div style={hodCard}>
          <h3 style={hodValue}>{summary.totalHODs}</h3>
          <p style={topLabel}>HODs</p>
        </div>

        <div style={adminCard}>
          <h3 style={adminValue}>{summary.totalAdmins}</h3>
          <p style={topLabel}>Admins</p>
        </div>
      </div>

      <div style={tableBox}>
        <h3 style={sectionTitle}>System Users</h3>

        {users.length === 0 ? (
          <p style={emptyText}>No users found ❌</p>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Role</th>
                  <th style={th}>Department</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id || index}>
                    <td style={td}>{user.name || "-"}</td>
                    <td style={td}>{user.email || "-"}</td>
                    <td style={td}>
                      <span style={getRoleBadgeStyle(user.role)}>
                        {String(user.role || "-").toUpperCase()}
                      </span>
                    </td>
                    <td style={td}>{user.department || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserManagement;

const container = {
  padding: "24px",
  minHeight: "100vh",
  color: "#e2e8f0",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)"
};

const title = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8",
  marginBottom: "8px"
};

const subtitle = {
  color: "#94a3b8",
  marginBottom: "24px",
  fontSize: "15px"
};

const topCardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "18px",
  marginBottom: "24px"
};

const topCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const studentCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(20,83,45,0.95), rgba(5,46,22,0.95))",
  border: "1px solid rgba(74,222,128,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const mentorCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(8,47,73,0.95), rgba(12,74,110,0.95))",
  border: "1px solid rgba(56,189,248,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const hodCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(120,53,15,0.95), rgba(69,26,3,0.95))",
  border: "1px solid rgba(250,204,21,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const adminCard = {
  padding: "22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(127,29,29,0.95), rgba(69,10,10,0.95))",
  border: "1px solid rgba(248,113,113,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.28)"
};

const topValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: "0 0 8px 0"
};

const studentValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#4ade80",
  margin: "0 0 8px 0"
};

const mentorValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#38bdf8",
  margin: "0 0 8px 0"
};

const hodValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#facc15",
  margin: "0 0 8px 0"
};

const adminValue = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#f87171",
  margin: "0 0 8px 0"
};

const topLabel = {
  color: "#cbd5e1",
  fontSize: "15px",
  margin: 0
};

const tableBox = {
  background: "rgba(15, 23, 42, 0.92)",
  padding: "22px",
  borderRadius: "18px",
  overflowX: "auto",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#38bdf8",
  fontSize: "20px",
  fontWeight: "700"
};

const emptyText = {
  color: "#f87171",
  fontSize: "15px"
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "800px"
};

const th = {
  padding: "14px 12px",
  textAlign: "left",
  background: "#1e293b",
  color: "#38bdf8",
  borderBottom: "1px solid #334155",
  fontSize: "14px",
  fontWeight: "700"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #1e293b",
  color: "#e2e8f0",
  fontSize: "14px",
  verticalAlign: "middle"
};

const roleBadge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.4px"
};