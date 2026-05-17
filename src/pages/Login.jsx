import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, setAuthToken } from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("admin@church.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authAPI.login(email, password);

      if (result) {
        // Store tokens
        setAuthToken(result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("userRole", result.user.role);
        localStorage.setItem("userName", result.user.name);

        alert("Login successful ✅");

        // Route based on role
        if (result.user.role === "admin") {
          navigate("/dashboard");
        } else if (result.user.role === "council") {
          navigate("/council-dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Church Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-3 p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-3 p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
          <strong>Demo Credentials:</strong>
          <div className="mt-2 space-y-1">
            <p>👤 <strong>Admin:</strong> admin@church.com / demo123</p>
            <p>👥 <strong>Council:</strong> council@church.com / demo123</p>
            <p>📖 <strong>Member:</strong> member@church.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
