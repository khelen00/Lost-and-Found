
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login({ onSwitchToRegister }) {
  const { login, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await login(email, password);
      setMessage("Login successful.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not log in. Check your email and password."
      );
    }
  }

  return (
    <main className="main auth-main">
      <section className="card form-card auth-card">
        <p className="subtitle">CAMPUS LOST &amp; FOUND</p>
        <h1>Student Login</h1>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button className="blue" type="submit" disabled={authLoading}>
            {authLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <button
            className="secondary"
            type="button"
            onClick={onSwitchToRegister}
          >
            Register
          </button>
        </p>
      </section>
    </main>
  );
}

export default Login;
