
function PossibleMatches({ reports }) {
  const lostReports = reports.filter((report) => report.type === "Lost");
  const foundReports = reports.filter((report) => report.type === "Found");

  function findMatches(lostItem) {
    return foundReports.filter((foundItem) => {
      const sameCategory = foundItem.category === lostItem.category;

      const lostTitle = lostItem.title.toLowerCase();
      const foundTitle = foundItem.title.toLowerCase();

      const similarName =
        lostTitle.includes(foundTitle) ||
        foundTitle.includes(lostTitle);

      return sameCategory || similarName;
    });
  }

  return (
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
                <p>
                  <strong>Category:</strong> {lostItem.category}
                </p>

                {matches.length > 0 ? (
                  matches.map((match) => (
                    <div key={match._id}>
                      <p>
                        <strong>Possible match:</strong> {match.title}
                      </p>
                      <p>
                        <strong>Location:</strong> {match.location}
                      </p>
                      <p>
                        <strong>Description:</strong> {match.description}
                      </p>
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
  );
}

export default PossibleMatches;
