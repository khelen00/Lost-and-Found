
import { useEffect, useState } from "react";

function ReportCard({ report, actions, children }) {
  const [imageOpen, setImageOpen] = useState(false);

  useEffect(() => {
    if (!imageOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setImageOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageOpen]);

  if (!report) return null;

  const title = report.title || "Untitled Item";

  const rawImage =
    report.imageUrl ||
    report.photoUrl ||
    report.photo ||
    report.image;

  const imageSrc =
    typeof rawImage === "string"
      ? rawImage
      : rawImage?.url;

  const reportedDate = report.createdAt
    ? new Date(report.createdAt)
    : null;

  const formattedDate =
    reportedDate && !Number.isNaN(reportedDate.getTime())
      ? reportedDate.toLocaleDateString()
      : null;

  return (
    <article className="report-item">
      <div className="report-heading">
        <div>
          <h3>{title}</h3>
          <p>{report.category || "Uncategorized"}</p>
        </div>

        <span
          className={
            report.type === "Lost" ? "tag lost" : "tag found"
          }
        >
          {report.type}
        </span>
      </div>

      {imageSrc && (
        <div className="report-image-container">
          <button
            type="button"
            onClick={() => setImageOpen(true)}
            aria-label={`View larger photo of ${title}`}
            title="Click to enlarge"
            style={{
              display: "block",
              width: "100%",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "zoom-in",
            }}
          >
            <img
              className="report-image"
              src={imageSrc}
              alt={`Photo of ${title}`}
              loading="lazy"
            />
          </button>
          <p className="form-hint">Click photo to enlarge</p>
        </div>
      )}

      <div className="report-details">
        <p>
          <strong>Location:</strong>{" "}
          {report.location || "Not specified"}
        </p>

        <p>
          <strong>Description:</strong>{" "}
          {report.description || "No description provided."}
        </p>

        {formattedDate && (
          <p>
            <strong>Reported on:</strong> {formattedDate}
          </p>
        )}

        {report.status && (
          <p>
            <strong>Status:</strong> {report.status}
          </p>
        )}
      </div>

      {children}

      {actions && (
        <div className="form-actions">{actions}</div>
      )}

      {imageOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${title}`}
          onClick={() => setImageOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => setImageOpen(false)}
            aria-label="Close enlarged photo"
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              color: "#ffffff",
              background: "#263247",
              border: "1px solid #64748b",
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Close ✕
          </button>

          <img
            src={imageSrc}
            alt={`Enlarged photo of ${title}`}
            onClick={(event) => event.stopPropagation()}
            style={{
              display: "block",
              maxWidth: "90vw",
              maxHeight: "85vh",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </article>
  );
}

export default ReportCard;
