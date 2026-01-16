import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyMenus } from "../api/menus";
import "./Login.css";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isLoading, error, getUserRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      // Store username in localStorage for Header to display
      localStorage.setItem("username", username);

      try {
        // Call a GET API to trigger server to set fresh XSRF-TOKEN cookie
        // This ensures the AntiForgeryToken matches the current authenticated user
        await getMyMenus();
      } catch (error) {
        // Ignore menu fetch errors, we just need to trigger the cookie refresh
        console.warn('Menu fetch failed, but continuing with login:', error);
      }

      // Get user role from token and redirect accordingly
      const userRole = getUserRole();
      console.log('Login successful, user role:', userRole);

      // Redirect based on user role
      if (userRole === "Electrician") {
        console.log('Redirecting to /electrician/repairs');
        navigate("/electrician/repairs", { replace: true });
      } else if (userRole === "Teacher") {
        console.log('Redirecting to /repairs');
        navigate("/repairs", { replace: true });
      } else {
        // Default to dashboard for Admin or other roles
        console.log('Redirecting to /dashboard');
        navigate("/dashboard", { replace: true });
      }
    } else {
      console.error('Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Nexus Service Desk</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};
