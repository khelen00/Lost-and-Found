
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login({ onSwitchToRegister }) {
  const { login, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }

    try {
      await login(cleanEmail, password);
      setMessage("Login successful.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not log in. Check your email and password."
      );
    }
  }

  return (
    <main className="main auth-main findit-auth">
      <div className="findit-auth-layout">
        {/* Left welcome panel */}
        <section className="findit-auth-welcome">
          <div className="findit-brand">
            <div className="findit-logo" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
    
                <circle
                  cx="22"
                  cy="18"
                  r="7"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                />
                <path
                  d="M27 23L32 28"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span>FindIt</span>
          </div>

          {/* Campus image */}
          <div className="findit-login-image">
            <img
              src="/images/campus-login.jpeg"
              alt="College campus"
            />
          </div>

          <div className="findit-welcome-copy">
            <span className="findit-eyebrow">
              CAMPUS LOST &amp; FOUND
            </span>
            <h2>Lost something? Let's find it.</h2>
            <p>We've got your back.</p>
          </div>

          <div className="findit-welcome-footer">
            IN YOUR CAMPUS
          </div>
        </section>

        {/* Right login panel */}
        <section className="card form-card auth-card findit-login-card">
          <div className="findit-form-heading">
            <span className="findit-eyebrow">WELCOME BACK</span>
            <h1>Student Login</h1>
            <p>Sign in to continue to FindIt.</p>
          </div>

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
              placeholder="you@college.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              maxLength={254}
              required
              disabled={authLoading}
            />

            <label htmlFor="login-password">Password</label>

            <div className="findit-password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                maxLength={128}
                required
                disabled={authLoading}
              />

              <button
                className="findit-password-toggle"
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
                disabled={authLoading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              className="blue findit-login-button"
              type="submit"
              disabled={authLoading}
            >
              {authLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="findit-register-prompt">
            <span>Don't have an account?</span>
            <button
              className="secondary"
              type="button"
              onClick={onSwitchToRegister}
              disabled={authLoading}
            >
              Register
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
