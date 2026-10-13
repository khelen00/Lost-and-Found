
import { useEffect, useState } from "react";
import api from "../services/api";

function MyClaims({ refreshKey = 0 }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchClaims() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/claims/mine");
        const data = response.data;

        if (!cancelled) {
          setClaims(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.claims)
                ? data.claims
                : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Could not load your claims."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClaims();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function getStatus(claim) {
    const status = claim.status || "Pending";

    if (["Pending", "Approved", "Rejected"].includes(status)) {
      return status;
    }

    return status;
  }

  function getStatusMessage(status) {
    switch (status) {
      case "Approved":
        return "Your claim has been approved by the item reporter.";

      case "Rejected":
        return "Your claim was rejected by the item reporter.";

      case "Pending":
        return "Your claim is waiting for the item reporter to review it.";

      default:
        return "Check the status of your claim for the latest update.";
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "Approved":
        return "claim-status--approved";

      case "Rejected":
        return "claim-status--rejected";

      default:
        return "claim-status--pending";
    }
  }

  const pendingCount = claims.filter(
    (claim) => getStatus(claim) === "Pending"
  ).length;

  const approvedCount = claims.filter(
    (claim) => getStatus(claim) === "Approved"
  ).length;

  const rejectedCount = claims.filter(
    (claim) => getStatus(claim) === "Rejected"
  ).length;

  return (
    <section className="card">
      <h2>My Claims</h2>
      <p>Track requests for items you believe belong to you.</p>

      {!loading && !error && claims.length > 0 && (
        <div className="claim-summary">
          <div className="claim-summary-item">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="claim-summary-item">
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>

          <div className="claim-summary-item">
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading claims...</p>
      ) : error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <h3>No claims yet</h3>
          <p>Browse found items to submit your first claim.</p>
        </div>
      ) : (
        <div className="report-list">
          {claims.map((claim) => {
            const status = getStatus(claim);
            const item = claim.reportId;

            return (
              <article className="report-item" key={claim._id}>
                <div className="report-heading">
                  <div>
                    <h3>
                      {item?.title || "Item no longer available"}
                    </h3>
                    <p>{item?.category || "Category unavailable"}</p>
                  </div>

                  <span
                    className={`tag claim-status ${getStatusClass(status)}`}
                    aria-label={`Claim status: ${status}`}
                  >
                    {status}
                  </span>
                </div>

                {item && (
                  <>
                    <p>
                      <strong>Location:</strong>{" "}
                      {item.location || "Not specified"}
                    </p>

                    {item.description && (
                      <p>
                        <strong>Description:</strong>{" "}
                        {item.description}
                      </p>
                    )}
                  </>
                )}

                <p>
                  <strong>Your explanation:</strong>{" "}
                  {claim.explanation || claim.message || "Not provided"}
                </p>

                {claim.createdAt && (
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                )}

                <p className="claim-status-message" role="status">
                  {getStatusMessage(status)}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyClaims;
