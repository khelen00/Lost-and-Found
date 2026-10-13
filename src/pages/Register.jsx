
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Register({ onSwitchToLogin }) {
  const { register, authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await register(name, email, password);
      setMessage("Registration successful.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create your account. Please try again."
      );
    }
  }

  return (
    <main className="main auth-main">
      <section className="card form-card auth-card">
        <p className="subtitle">CAMPUS LOST &amp; FOUND</p>
        <h1>Create Account</h1>

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
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button className="blue" type="submit" disabled={authLoading}>
            {authLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p>
          Already registered?{" "}
          <button
            className="secondary"
            type="button"
            onClick={onSwitchToLogin}
          >
            Log In
          </button>
        </p>
      </section>
    </main>
  );
}

export default Register;
