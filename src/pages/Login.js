import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/bg1.jpg";
import API from "../api/api";

function Login({ setRole }) {
  const [user, setUser] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setUser({
      email: "",
      password: ""
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const redirectUser = (role) => {
    if (role === "student") navigate("/dashboard");
    else if (role === "mentor") navigate("/mentor");
    else if (role === "hod") navigate("/hod");
    else if (role === "admin") navigate("/admin");
    else navigate("/");
  };

  const handleLogin = async () => {
    const email = user.email.trim().toLowerCase();
    const password = user.password.trim();

    if (!email || !password) {
      alert("Please enter email and password ❌");
      return;
    }

    if (!email.endsWith("@mlrit.ac.in")) {
      alert("Use college email only ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password
      });

      console.log("LOGIN RESPONSE:", res.data);

      const loggedUser = res?.data?.user || {};
      const token = res?.data?.token || "";
      const role = String(loggedUser.role || "").trim().toLowerCase();

      if (!token) {
        alert("Token not received from backend ❌");
        return;
      }

      if (!role) {
        alert("Role not found from backend ❌");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem(
        "userEmail",
        String(loggedUser.email || "").trim().toLowerCase()
      );
      localStorage.setItem("userName", loggedUser.name || "");
      localStorage.setItem("department", loggedUser.department || "");
      localStorage.setItem("userData", JSON.stringify(loggedUser));
      console.log("TOKEN IN STORAGE:", localStorage.getItem("token"));
      console.log("ROLE IN STORAGE:", localStorage.getItem("role"));
      console.log("EMAIL IN STORAGE:", localStorage.getItem("userEmail"));

      if (setRole) {
        setRole(role);
      }

      alert("Login successful ✅");
      redirectUser(role);
    } catch (error) {
      console.log("Login error:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Login failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div style={page}>
      <div style={overlay}></div>

      <div style={box}>
        <h2 style={title}>Welcome Back</h2>
        <p style={subtitle}>Login to continue to EduTrackPro</p>

        <input
          type="email"
          name="email"
          placeholder="College Email"
          value={user.email}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          style={input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="new-password"
          style={input}
        />

        <button
          onClick={handleLogin}
          style={loading ? disabledButton : button}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={footerText}>
          New student?{" "}
          <Link to="/register" style={link}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

const page = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative"
};

const overlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.65)"
};

const box = {
  position: "relative",
  width: "360px",
  background: "rgba(255,255,255,0.95)",
  padding: "32px",
  borderRadius: "18px",
  zIndex: 1,
  boxShadow: "0 12px 35px rgba(0,0,0,0.35)"
};

const title = {
  textAlign: "center",
  color: "#0f172a",
  fontSize: "28px",
  fontWeight: "700",
  marginBottom: "8px"
};

const subtitle = {
  textAlign: "center",
  color: "#475569",
  marginBottom: "22px"
};

const input = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none"
};

const button = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  background: "linear-gradient(90deg, #2563eb, #06b6d4)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer"
};

const disabledButton = {
  ...button,
  opacity: 0.7,
  cursor: "not-allowed"
};

const footerText = {
  textAlign: "center",
  marginTop: "18px",
  color: "#475569"
};

const link = {
  color: "#2563eb",
  fontWeight: "600",
  textDecoration: "none"
};