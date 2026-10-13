
import ReportCard from "../components/ReportCard";

function MyReports({ reports, user, onDelete }) {
  const myReports = reports.filter((report) => {
    const ownerId =
      typeof report.userId === "object"
        ? report.userId?._id
        : report.userId;

    return ownerId?.toString() === user?.id?.toString();
  });

  return (
    <section className="card">
      <h2>My Reports</h2>

      {myReports.length === 0 ? (
        <p>You have not submitted any reports yet.</p>
      ) : (
        <div className="report-list">
          {myReports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              actions={
                <button
                  className="delete-button"
                  onClick={() => onDelete(report._id)}
                >
                  Delete Report
                </button>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default MyReports;
