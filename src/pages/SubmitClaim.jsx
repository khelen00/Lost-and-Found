
import { useState } from "react";
import api from "../services/api";

function SubmitClaim({ report, onSuccess, onCancel }) {
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!explanation.trim()) {
      setError("Please explain why this item belongs to you.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/claims", {
        reportId: report._id,
        explanation: explanation.trim(),
      });

      setExplanation("");
      onSuccess?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not submit your claim."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!report) {
    return (
      <section className="card">
        <h2>No Item Selected</h2>
        <p>Choose a found item before submitting a claim.</p>
        <button className="secondary" onClick={onCancel}>
          Go Back
        </button>
      </section>
    );
  }

  return (
    <section className="card form-card">
      <h2>Claim: {report.title}</h2>

      <p><strong>Category:</strong> {report.category}</p>
      <p><strong>Found at:</strong> {report.location}</p>
      <p><strong>Description:</strong> {report.description}</p>

      <p>
        Explain how you can identify this item as yours.
        Do not include passwords or sensitive account details.
      </p>

      {error && (
        <p className="error-message" role="alert">{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="claim-explanation">
          Why is this your item?
        </label>

        <textarea
          id="claim-explanation"
          rows={5}
          maxLength={1000}
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          placeholder="Describe identifying details or proof of ownership."
          required
        />

        <p>{explanation.length}/1000 characters</p>

        <div className="form-actions">
          <button
            className="green"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Claim"}
          </button>

          <button
            className="secondary"
            type="button"
            disabled={submitting}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default SubmitClaim;
