
import ReportCard from "../components/ReportCard";

function Dashboard({ reports, loading, setPage }) {
  const lostReports = reports.filter((report) => report.type === "Lost");
  const foundReports = reports.filter((report) => report.type === "Found");

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <section className="welcome">
        <p>WELCOME TO YOUR CAMPUS</p>
        <h2>Lost something? Let's find it.</h2>
        <p>
          Report lost belongings or help return found items to
          their rightful owners.
        </p>

        <div className="dashboard-actions">
          <button
            type="button"
            className="blue"
            onClick={() => setPage("Report Lost")}
          >
            + Report Lost Item
          </button>

          <button
            type="button"
            className="green"
            onClick={() => setPage("Report Found")}
          >
            + Report Found Item
          </button>

          <button
            type="button"
            className="green"
            onClick={() => setPage("Browse Found Items")}
          >
            Browse Found Items
          </button>
        </div>
      </section>

      {/* Statistics */}
      <section className="cards">
        <div
          className="card clickable"
          role="button"
          tabIndex={0}
          onClick={() => setPage("My Reports")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setPage("My Reports");
            }
          }}
        >
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

      {/* Recent Reports */}
      <section className="card">
        <div className="dashboard-section-header">
          <div>
            <h2>Recent Reports</h2>
            <p>Recently reported lost and found items.</p>
          </div>

          {reports.length > 0 && !loading && (
            <button
              type="button"
              className="blue"
              onClick={() => setPage("My Reports")}
            >
              View My Reports
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="dashboard-empty">
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
