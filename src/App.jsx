
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import api from "./services/api";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyReports from "./pages/MyReports";
import ReportForm from "./pages/ReportForm";
import PossibleMatches from "./pages/PossibleMatches";
import BrowseFoundItems from "./pages/BrowseFoundItems";
import SubmitClaim from "./pages/SubmitClaim";
import MyClaims from "./pages/MyClaims";
import AdminPanel from "./pages/AdminPanel";
import MainLayout from "./layouts/MainLayout";

import "./App.css";

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  const [authPage, setAuthPage] = useState("login");
  const [page, setPage] = useState("Dashboard");
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [claimsRefreshKey, setClaimsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchReports = useCallback(async () => {
    if (!isAuthenticated) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/reports");
      setReports(response.data.reports || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load reports."
      );

      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  function openPage(nextPage) {
    setPage(nextPage);
    setError("");
    setMessage("");

    if (nextPage === "My Claims") {
      setClaimsRefreshKey((current) => current + 1);
    }
  }

  
  async function submitReport(reportData) {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("title", reportData.title);
      formData.append("category", reportData.category);
      formData.append("location", reportData.location);
      formData.append("description", reportData.description);
      formData.append("type", reportData.type);

      if (reportData.imageFile) {
        formData.append("image", reportData.imageFile);
      }

      await api.post("/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchReports();

      setMessage("Report submitted successfully.");
      setPage("My Reports");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Could not submit your report.";

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }


  
async function deleteReport(id) {
  const reportToDelete = reports.find(
    (report) => report._id === id
  );

  const itemName = reportToDelete?.title || "this report";

  const confirmed = window.confirm(
    `Are you sure you want to delete "${itemName}"?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
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

  function selectItemToClaim(report) {
    setSelectedReport(report);
    openPage("Submit Claim");
  }

  function handleClaimSuccess() {
    setSelectedReport(null);
    setClaimsRefreshKey((current) => current + 1);
    setMessage("Claim submitted successfully.");
    setPage("My Claims");
  }

  if (!isAuthenticated) {
    return authPage === "register" ? (
      <Register onSwitchToLogin={() => setAuthPage("login")} />
    ) : (
      <Login onSwitchToRegister={() => setAuthPage("register")} />
    );
  }

  return (
    <MainLayout
      page={page}
      setPage={openPage}
      user={user}
      logout={logout}
    >
      {error && (
        <p className="error-message" role="alert">{error}</p>
      )}

      {message && (
        <p className="success-message" role="status">{message}</p>
      )}

      {page === "Dashboard" && (
        <Dashboard
          reports={reports}
          loading={loading}
          setPage={openPage}
        />
      )}

      {page === "My Reports" && (
        <MyReports
          reports={reports}
          user={user}
          onDelete={deleteReport}
        />
      )}

      {(page === "Report Lost" || page === "Report Found") && (
        <ReportForm
          page={page}
          onSubmit={submitReport}
          submitting={submitting}
          setPage={openPage}
        />
      )}

      {page === "Possible Matches" && (
        <PossibleMatches reports={reports} />
      )}

      {page === "Browse Found Items" && (
        <BrowseFoundItems
          reports={reports}
          onSelectItem={selectItemToClaim}
          user={user}
        />
      )}

      {page === "Submit Claim" && (
        <SubmitClaim
          report={selectedReport}
          onSuccess={handleClaimSuccess}
          onCancel={() => openPage("Browse Found Items")}
        />
      )}

      {page === "My Claims" && (
        <MyClaims refreshKey={claimsRefreshKey} />
      )}

      {page === "Admin Panel" && <AdminPanel />}
    </MainLayout>
  );
}
export default App;
