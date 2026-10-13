
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function AdminPanel() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchClaims = useCallback(async () => {
    setError("");

    try {
      const response = await api.get("/claims/received");
      const data = response.data;

      setClaims(Array.isArray(data) ? data : data.claims || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load received claims."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  async function updateClaimStatus(claimId, status) {
    setError("");
    setMessage("");
    setUpdatingId(claimId);

    try {
      const response = await api.patch(
        `/claims/${claimId}/status`,
        { status }
      );

      setClaims((current) =>
        current.map((claim) =>
          claim._id === claimId
            ? {
                ...claim,
                status: response.data.claim?.status || status,
              }
            : claim
        )
      );

      setMessage(
        response.data.message ||
          `Claim ${status.toLowerCase()} successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update the claim status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="card">
      <h2>Review Claims on Your Found Items</h2>
      <p>
        Review ownership explanations for items you reported as found.
        Only the report owner should be allowed to approve or reject a claim.
      </p>

      {error && (
        <p className="error-message" role="alert">{error}</p>
      )}

      {message && (
        <p className="success-message" role="status">{message}</p>
      )}

      {loading ? (
        <p>Loading received claims...</p>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <h3>No claims received yet</h3>
          <p>
            Claims submitted for your found items will appear here.
          </p>
        </div>
      ) : (
        <div className="report-list">
          {claims.map((claim) => {
            const status = claim.status || "Pending";
            const isPending = status.toLowerCase() === "pending";

            return (
              <article className="report-item" key={claim._id}>
                <div className="report-heading">
                  <div>
                    <h3>
                      {claim.reportId?.title || "Item unavailable"}
                    </h3>
                    <p>
                      {claim.reportId?.category ||
                        "Category unavailable"}
                    </p>
                  </div>

                  <span className="tag">{status}</span>
                </div>

                <p>
                  <strong>Found at:</strong>{" "}
                  {claim.reportId?.location || "Location unavailable"}
                </p>

                <p>
                  <strong>Claimant:</strong>{" "}
                  {claim.claimantId?.name || "Student"}
                </p>

                <p>
                  <strong>Claimant email:</strong>{" "}
                  {claim.claimantId?.email || "Not available"}
                </p>

                <p><strong>Ownership explanation:</strong></p>
                <p>
                  {claim.explanation ||
                    claim.message ||
                    "No explanation provided"}
                </p>

                {claim.createdAt && (
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(claim.createdAt).toLocaleString()}
                  </p>
                )}

                {isPending && (
                  <div className="form-actions">
                    <button
                      className="green"
                      disabled={Boolean(updatingId)}
                      onClick={() =>
                        updateClaimStatus(claim._id, "Approved")
                      }
                    >
                      {updatingId === claim._id
                        ? "Updating..."
                        : "Approve Claim"}
                    </button>

                    <button
                      className="delete-button"
                      disabled={Boolean(updatingId)}
                      onClick={() =>
                        updateClaimStatus(claim._id, "Rejected")
                      }
                    >
                      {updatingId === claim._id
                        ? "Updating..."
                        : "Reject Claim"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AdminPanel;
