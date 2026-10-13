
import ReportCard from "../components/ReportCard";

function Dashboard({ reports, loading, setPage }) {
  const lostReports = reports.filter(
    (report) => report.type === "Lost"
  );

  const foundReports = reports.filter(
    (report) => report.type === "Found"
  );

  const stats = [
    {
      title: "Total Reports",
      value: reports.length,
      description: "Reports from all students",
      icon: "▤",
      color: "total",
      action: "My Reports",
    },
    {
      title: "Lost Items",
      value: lostReports.length,
      description: "Items reported missing",
      icon: "⌕",
      color: "lost",
    },
    {
      title: "Found Items",
      value: foundReports.length,
      description: "Items reported found",
      icon: "✓",
      color: "found",
    },
  ];

  return (
    <div className="dashboard dashboard-modern">
      <section className="welcome welcome-modern">
        <div className="welcome-content">
          <span className="welcome-eyebrow">
            IN YOUR CAMPUS
          </span>

          <h2>Lost something? Let's find it.</h2>

          <p>
            I got your backkk💪🏼
          </p>

          <div className="dashboard-actions">
            <button
              type="button"
              className="dashboard-action dashboard-action-lost"
              onClick={() => setPage("Report Lost")}
            >
              <span className="dashboard-action-icon">−</span>
              <span>
                <strong>Report Lost</strong>
                <small>Find your missing item</small>
              </span>
              <span className="dashboard-action-arrow">→</span>
            </button>

            <button
              type="button"
              className="dashboard-action dashboard-action-found"
              onClick={() => setPage("Report Found")}
            >
              <span className="dashboard-action-icon">+</span>
              <span>
                <strong>Report Found</strong>
                <small>Help someone find it</small>
              </span>
              <span className="dashboard-action-arrow">→</span>
            </button>

            <button
              type="button"
              className="dashboard-action dashboard-action-browse"
              onClick={() => setPage("Browse Found Items")}
            >
              <span className="dashboard-action-icon">⌕</span>
              <span>
                <strong>Browse Items</strong>
                <small>Explore found belongings</small>
              </span>
              <span className="dashboard-action-arrow">→</span>
            </button>
          </div>
        </div>

      </section>
      <section className="cards dashboard-stats" aria-label="Report statistics">
        {stats.map((stat) => (
          <article
            key={stat.title}
            className={`card stat-card stat-${stat.color}${
              stat.action ? " clickable" : ""
            }`}
            role={stat.action ? "button" : undefined}
            tabIndex={stat.action ? 0 : undefined}
            onClick={
              stat.action ? () => setPage(stat.action) : undefined
            }
            onKeyDown={
              stat.action
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setPage(stat.action);
                    }
                  }
                : undefined
            }
          >
            <div className="stat-card-top">
              <span className="stat-icon" aria-hidden="true">
                {stat.icon}
              </span>

              <span className="stat-indicator">
                {stat.action ? "View reports ↗" : "Overview"}
              </span>
            </div>

            <p className="stat-title">{stat.title}</p>

            <h2 className="stat-value">
              {loading ? "..." : stat.value}
            </h2>

            <p className="stat-description">{stat.description}</p>
          </article>
        ))}
      </section>

      <section className="card recent-reports-card">
        <div className="dashboard-section-header">
          <div>
            <span className="section-eyebrow">LATEST ACTIVITY</span>
            <h2>Recent Reports</h2>
            <p>Recently reported lost and found items.</p>
          </div>

          {reports.length > 0 && !loading && (
            <button
              type="button"
              className="recent-view-button"
              onClick={() => setPage("My Reports")}
            >
              View My Reports <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="dashboard-empty">
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-state-icon" aria-hidden="true">
              ▤
            </span>
            <h3>No reports yet</h3>
            <p>
              Submit your first lost or found item to get started.
            </p>
          </div>
        ) : (
          <div className="report-list">
            {reports.slice(0, 3).map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
