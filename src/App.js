import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Academics from "./pages/Academics";
import Counseling from "./pages/Counseling";
import Performance from "./pages/Performance";
import StudentRecord from "./pages/StudentRecord";
import Certifications from "./pages/Certifications";
import Activities from "./pages/Activities";
import Projects from "./pages/Projects";
import StudentAlerts from "./pages/StudentAlerts";

import MentorDashboard from "./pages/MentorDashboard";
import StudentsTable from "./pages/StudentsTable";
import Alerts from "./pages/Alerts";
import MentorStudentDetails from "./pages/MentorStudentDetails";

import HODDashboard from "./pages/HODDashboard";
import HODAttendance from "./pages/HODAttendance";
import HODPerformance from "./pages/HODPerformance";
import HODAnalytics from "./pages/HODAnalytics";
import HODStudents from "./pages/HODStudents";
import HODAlerts from "./pages/HODAlerts";

import AdminDashboard from "./pages/AdminDashboard";
import AdminStudentsList from "./pages/AdminStudentsList";
import AdminStudentDetails from "./pages/AdminStudentDetails";
import AdminCounseling from "./pages/AdminCounseling";
import AdminDepartmentOverview from "./pages/AdminDepartmentOverview";
import AdminPerformanceReports from "./pages/AdminPerformanceReports";
import AdminAttendanceReports from "./pages/AdminAttendanceReports";
import AdminUserManagement from "./pages/AdminUserManagement";

function App() {
  const [role, setRole] = useState(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    return token && storedRole ? storedRole : "";
  });

  const getDashboardPath = () => {
    const currentRole = String(role || "").trim().toLowerCase();

    if (currentRole === "student") return "/dashboard";
    if (currentRole === "mentor") return "/mentor";
    if (currentRole === "hod") return "/hod";
    if (currentRole === "admin") return "/admin";

    return "/";
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={role ? <Navigate to={getDashboardPath()} replace /> : <LandingPage />}
        />

        <Route
          path="/login"
          element={
            role ? (
              <Navigate to={getDashboardPath()} replace />
            ) : (
              <Login setRole={setRole} />
            )
          }
        />

        <Route
          path="/register"
          element={role ? <Navigate to={getDashboardPath()} replace /> : <Register />}
        />

        {/* ================= STUDENT ================= */}
        <Route
          path="/dashboard"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/student-record"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <StudentRecord />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/attendance"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <Attendance />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/academics"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <Academics />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/performance"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <Performance />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/student-alerts"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <StudentAlerts />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/counseling"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <Counseling />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/certifications"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <Certifications />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/activities"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <Activities />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/projects"
          element={
            role === "student" ? (
              <Layout setRole={setRole}>
                <Projects />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ================= MENTOR ================= */}
        <Route
          path="/mentor"
          element={
            role === "mentor" ? (
              <Layout setRole={setRole}>
                <MentorDashboard />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/students"
          element={
            role === "mentor" ? (
              <Layout setRole={setRole}>
                <StudentsTable />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/alerts"
          element={
            role === "mentor" ? (
              <Layout setRole={setRole}>
                <Alerts />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/mentor/student/:regNo"
          element={
            role === "mentor" ? (
              <Layout setRole={setRole}>
                <MentorStudentDetails />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ================= HOD ================= */}
        <Route
          path="/hod"
          element={
            role === "hod" ? (
              <Layout setRole={setRole}>
                <HODDashboard />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/hod-students"
          element={
            role === "hod" ? (
              <Layout setRole={setRole}>
                <HODStudents />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/hod-alerts"
          element={
            role === "hod" ? (
              <Layout setRole={setRole}>
                <HODAlerts />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/hod-attendance"
          element={
            role === "hod" ? (
              <Layout setRole={setRole}>
                <HODAttendance />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/hod-performance"
          element={
            role === "hod" ? (
              <Layout setRole={setRole}>
                <HODPerformance />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/hod-analytics"
          element={
            role === "hod" ? (
              <Layout setRole={setRole}>
                <HODAnalytics />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            role === "admin" ? (
              <Layout setRole={setRole}>
                <AdminDashboard />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin-students"
          element={
            role === "admin" ? (
              <Layout setRole={setRole}>
                <AdminStudentsList />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin-departments"
          element={
            role === "admin" ? (
              <Layout setRole={setRole}>
                <AdminDepartmentOverview />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin-performance"
          element={
            role === "admin" ? (
              <Layout setRole={setRole}>
                <AdminPerformanceReports />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin-attendance"
          element={
            role === "admin" ? (
              <Layout setRole={setRole}>
                <AdminAttendanceReports />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin-counseling"
          element={
            role === "admin" ? (
              <Layout setRole={setRole}>
                <AdminCounseling />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin-users"
          element={
            role === "admin" ? (
              <Layout setRole={setRole}>
                <AdminUserManagement />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/student/:regNo"
          element={
            role === "admin" ? (
              <Layout setRole={setRole}>
                <AdminStudentDetails />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function Layout({ children, setRole }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar setRole={setRole} />
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

export default App;