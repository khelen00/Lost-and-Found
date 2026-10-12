
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("campusToken") || ""
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("campusUser") || "null");
    } catch {
      return null;
    }
  });

  const [authPage, setAuthPage] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [page, setPage] = useState("Dashboard");
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [claimExplanation, setClaimExplanation] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // API client: automatically sends the current login token.
  const api = axios.create({
    baseURL: API_URL,
  });

  api.interceptors.request.use((config) => {
    const savedToken = localStorage.getItem("campusToken");

    if (savedToken) {
      config.headers.Authorization = `Bearer ${savedToken}`;
    }

    return config;
  });

  const logout = useCallback(() => {
    localStorage.removeItem("campusToken");
    localStorage.removeItem("campusUser");

    setToken("");
    setUser(null);
    setReports([]);
    setClaims([]);
    setSelectedReport(null);
    setPage("Dashboard");
    setMessage("");
    setError("");
  }, []);

  async function fetchReports() {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/reports");
      setReports(response.data.reports || []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        setError("Your session expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message || "Could not load reports."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchClaims() {
    if (!token) return;

    try {
      const response = await api.get("/claims/mine");
      setClaims(response.data.claims || []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        setError("Your session expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message || "Could not load your claims."
        );
      }
    }
  }

  useEffect(() => {
    if (token) {
      fetchReports();
    } else {
      setReports([]);
      setLoading(false);
    }
  }, [token]);

  async function handleAuth(event) {
    event.preventDefault();
    setAuthBusy(true);
    setError("");
    setMessage("");

    try {
      const endpoint =
        authPage === "register" ? "/auth/register" : "/auth/login";

      const payload =
        authPage === "register"
          ? {
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
            }
          : {
              email: authEmail.trim(),
              password: authPassword,
            };

      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      localStorage.setItem("campusToken", response.data.token);
      localStorage.setItem("campusUser", JSON.stringify(response.data.user));

      setToken(response.data.token);
      setUser(response.data.user);
      setAuthPassword("");
      setPage("Dashboard");
      setMessage(response.data.message || "Welcome!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not connect to the backend. Check that it is running."
      );
    } finally {
      setAuthBusy(false);
    }
  }

  function openPage(nextPage) {
    setPage(nextPage);
    setMessage("");
    setError("");

    if (nextPage === "My Claims") {
      fetchClaims();
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await api.post("/reports", {
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        type: page === "Report Lost" ? "Lost" : "Found",
      });

      setTitle("");
      setCategory("Electronics");
      setLocation("");
      setDescription("");

      await fetchReports();
      setMessage("Report submitted successfully.");
      setPage("My Reports");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not submit your report."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function submitClaim(event) {
    event.preventDefault();

    if (!selectedReport || !claimExplanation.trim()) {
      setError("Please explain why this item belongs to you.");
      return;
    }

    setClaimSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.post("/claims", {
        reportId: selectedReport._id,
        explanation: claimExplanation.trim(),
      });

      setClaimExplanation("");
      setSelectedReport(null);
      setMessage("Claim submitted successfully.");

      await fetchClaims();
      setPage("My Claims");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not submit your claim."
      );
    } finally {
      setClaimSubmitting(false);
    }
  }

  async function deleteReport(id) {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/reports/${id}`);
      setReports((current) =>
        current.filter((report) => report._id !== id)
      );
      setMessage("Report deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete the report."
      );
    }
  }

  const lostReports = reports.filter((report) => report.type === "Lost");
  const foundReports = reports.filter((report) => report.type === "Found");

  function findMatches(lostItem) {
    return foundReports.filter((foundItem) => {
      const sameCategory = foundItem.category === lostItem.category;
      const lostTitle = lostItem.title.toLowerCase();
      const foundTitle = foundItem.title.toLowerCase();

      return (
        sameCategory ||
        lostTitle.includes(foundTitle) ||
        foundTitle.includes(lostTitle)
      );
    });
  }

  // Authentication screen
  if (!token) {
    return (
      <div className="app">
        <main className="main auth-main">
          <section className="card form-card auth-card">
            <p className="subtitle">CAMPUS LOST &amp; FOUND</p>

            <h1>
              {authPage === "login" ? "Student Login" : "Create Account"}
            </h1>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleAuth}>
              {authPage === "register" && (
                <>
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </>
              )}

              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                autoComplete={
                  authPage === "login" ? "current-password" : "new-password"
                }
                minLength={8}
                required
              />

              <button className="blue" type="submit" disabled={authBusy}>
                {authBusy
                  ? "Please wait..."
                  : authPage === "login"
                    ? "Log In"
                    : "Create Account"}
              </button>
            </form>

            <p>
              {authPage === "login"
                ? "Don't have an account? "
                : "Already registered? "}

              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setAuthPage(
                    authPage === "login" ? "register" : "login"
                  );
                  setError("");
                  setMessage("");
                }}
              >
                {authPage === "login" ? "Register" : "Log In"}
              </button>
            </p>
          </section>
        </main>
      </div>
    );
  }

  const myReports = reports.filter((report) => {
    const ownerId =
      typeof report.userId === "object"
        ? report.userId?._id
        : report.userId;

    return ownerId?.toString() === user?.id?.toString();
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Campus</h2>
        <p className="subtitle">LOST &amp; FOUND</p>

        <nav>
          {[
            "Dashboard",
            "My Reports",
            "Possible Matches",
            "Browse Found Items",
            "My Claims",
            "Admin Panel",
          ].map((item) => (
            <button
              key={item}
              className={page === item ? "active" : ""}
              onClick={() => openPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <p className="student">{user?.name || "Student Account"}</p>
        <button className="secondary" onClick={logout}>
          Log Out
        </button>
      </aside>

      <main className="main">
        <header>
          <div>
            <p className="subtitle">COLLEGE PORTAL</p>
            <h1>{page}</h1>
          </div>

          <span className="profile">
            {(user?.name || "S").charAt(0).toUpperCase()}
          </span>
        </header>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {message && <p className="success-message">{message}</p>}

        {page === "Dashboard" && (
          <>
            <section className="welcome">
              <p>WELCOME TO YOUR CAMPUS</p>
              <h2>Lost something? Let's find it.</h2>
              <p>Report lost belongings or help return found items.</p>

              <button className="blue" onClick={() => openPage("Report Lost")}>
                + Report Lost Item
              </button>

              <button className="green" onClick={() => openPage("Report Found")}>
                + Report Found Item
              </button>

              <button
                className="green"
                onClick={() => openPage("Browse Found Items")}
              >
                Browse Found Items
              </button>
            </section>

            <section className="cards">
              <div className="card clickable" onClick={() => openPage("My Reports")}>
                <h3>Total Reports</h3>
                <h2>{loading ? "..." : reports.length}</h2>
                <p>Reports from all students.</p>
              </div>

              <div className="card">
                <h3>Lost Items</h3>
                <h2>{loading ? "..." : lostReports.length}</h2>
                <p>Items reported missing.</p>
              </div>

              <div className="card">
                <h3>Found Items</h3>
                <h2>{loading ? "..." : foundReports.length}</h2>
                <p>Items reported found.</p>
              </div>
            </section>

            <section className="card">
              <h2>Recent Reports</h2>

              {loading ? (
                <p>Loading reports...</p>
              ) : reports.length === 0 ? (
                <p>No reports yet. Submit your first lost or found item.</p>
              ) : (
                <div className="report-list">
                  {reports.slice(0, 3).map((report) => (
                    <article className="report-item" key={report._id}>
                      <div className="report-heading">
                        <div>
                          <h3>{report.title}</h3>
                          <p>{report.category}</p>
                        </div>
                        <span className={report.type === "Lost" ? "tag lost" : "tag found"}>
                          {report.type}
                        </span>
                      </div>
                      <p><strong>Location:</strong> {report.location}</p>
                      <p><strong>Status:</strong> {report.status}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {(page === "Report Lost" || page === "Report Found") && (
          <section className="card form-card">
            <h2>{page === "Report Lost" ? "Report a Lost Item" : "Report a Found Item"}</h2>

            <form onSubmit={submitReport}>
              <label htmlFor="item-title">Item name</label>
              <input
                id="item-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Black headphones"
                required
              />

              <label htmlFor="item-category">Category</label>
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {[
                  "Electronics", "ID Card", "Books", "Bags", "Bottle",
                  "Clothing", "Keys", "Accessories", "Wallet", "Other",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <label htmlFor="item-location">
                {page === "Report Lost" ? "Where did you lose it?" : "Where did you find it?"}
              </label>
              <input
                id="item-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Library, Block A"
                required
              />

              <label htmlFor="item-description">Description</label>
              <textarea
                id="item-description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item"
                required
              />

              <div className="form-actions">
                <button className={page === "Report Lost" ? "blue" : "green"} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
                <button className="secondary" type="button" onClick={() => openPage("Dashboard")}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {page === "My Reports" && (
          <section className="card">
            <h2>My Reports</h2>

            {myReports.length === 0 ? (
              <p>You have not submitted any reports yet.</p>
            ) : (
              <div className="report-list">
                {myReports.map((report) => (
                  <article className="report-item" key={report._id}>
                    <h3>{report.title}</h3>
                    <p><strong>Type:</strong> {report.type}</p>
                    <p><strong>Category:</strong> {report.category}</p>
                    <p><strong>Location:</strong> {report.location}</p>
                    <p><strong>Description:</strong> {report.description}</p>
                    <p><strong>Status:</strong> {report.status}</p>
                    <button className="delete-button" onClick={() => deleteReport(report._id)}>
                      Delete Report
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "Possible Matches" && (
          <section className="card">
            <h2>Possible Matches</h2>
            <p>Compare lost reports with found items.</p>

            {lostReports.length === 0 ? (
              <p>No lost reports are available yet.</p>
            ) : (
              <div className="report-list">
                {lostReports.map((lostItem) => {
                  const matches = findMatches(lostItem);

                  return (
                    <article className="report-item" key={lostItem._id}>
                      <h3>Lost: {lostItem.title}</h3>
                      <p><strong>Category:</strong> {lostItem.category}</p>

                      {matches.length ? (
                        matches.map((match) => (
                          <div key={match._id}>
                            <p><strong>Possible match:</strong> {match.title}</p>
                            <p><strong>Location:</strong> {match.location}</p>
                          </div>
                        ))
                      ) : (
                        <p>No possible found-item matches yet.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {page === "Browse Found Items" && (
          <section className="card">
            <h2>Found Items</h2>
            <p>Select an item you believe belongs to you.</p>

            {foundReports.length === 0 ? (
              <p>No found items are available yet.</p>
            ) : (
              <div className="report-list">
                {foundReports.map((report) => {
                  const ownerId =
                    typeof report.userId === "object"
                      ? report.userId?._id
                      : report.userId;

                  const isOwnReport =
                    ownerId?.toString() === user?.id?.toString();

                  return (
                    <article className="report-item" key={report._id}>
                      <h3>{report.title}</h3>
                      <p><strong>Category:</strong> {report.category}</p>
                      <p><strong>Location:</strong> {report.location}</p>
                      <p><strong>Description:</strong> {report.description}</p>

                      <button
                        className="green"
                        disabled={isOwnReport}
                        onClick={() => {
                          setSelectedReport(report);
                          setClaimExplanation("");
                          setError("");
                          setMessage("");
                          openPage("Submit Claim");
                        }}
                      >
                        {isOwnReport ? "Your Report" : "Claim This Item"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {page === "Submit Claim" && selectedReport && (
          <section className="card form-card">
            <h2>Claim: {selectedReport.title}</h2>
            <p><strong>Found at:</strong> {selectedReport.location}</p>
            <p>Explain how you can identify this item as yours. Do not reveal passwords or sensitive account details.</p>

            <form onSubmit={submitClaim}>
              <label htmlFor="claim-explanation">Why is this your item?</label>
              <textarea
                id="claim-explanation"
                rows="5"
                maxLength={1000}
                value={claimExplanation}
                onChange={(e) => setClaimExplanation(e.target.value)}
                placeholder="Describe identifying details or proof of ownership."
                required
              />

              <p>{claimExplanation.length}/1000 characters</p>

              <button className="green" disabled={claimSubmitting}>
                {claimSubmitting ? "Submitting..." : "Submit Claim"}
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setSelectedReport(null);
                  openPage("Browse Found Items");
                }}
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        {page === "My Claims" && (
          <section className="card">
            <h2>My Claims</h2>
            <p>Track requests for items you believe belong to you.</p>

            {claims.length === 0 ? (
              <div className="empty-state">
                <h3>No claims yet</h3>
                <p>Browse found items to submit your first claim.</p>
                <button className="green" onClick={() => openPage("Browse Found Items")}>
                  Browse Found Items
                </button>
              </div>
            ) : (
              <div className="report-list">
                {claims.map((claim) => (
                  <article className="report-item" key={claim._id}>
                    <h3>{claim.reportId?.title || "Item no longer available"}</h3>
                    {claim.reportId && (
                      <>
                        <p><strong>Category:</strong> {claim.reportId.category}</p>
                        <p><strong>Location:</strong> {claim.reportId.location}</p>
                      </>
                    )}
                    <p><strong>Explanation:</strong> {claim.explanation}</p>
                    <p><strong>Status:</strong> <span className="tag">{claim.status}</span></p>
                    <p><strong>Submitted:</strong> {new Date(claim.createdAt).toLocaleDateString()}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "Admin Panel" && (
          <section className="card">
            <h2>Admin Verification</h2>
            <div className="empty-state">
              <h3>Admin tools are not connected yet</h3>
              <p>Claim approval and rejection will be added in a later step.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
