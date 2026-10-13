
function PossibleMatches({ reports }) {
  const lostReports = reports.filter(
    (report) => report.type === "Lost"
  );

  const foundReports = reports.filter(
    (report) => report.type === "Found"
  );

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function getWordSet(value) {
    const normalized = normalize(value);

    return new Set(
      normalized
        .split(/\s+/)
        .filter((word) => word.length > 1)
    );
  }

  function similarity(first, second) {
    const firstWords = getWordSet(first);
    const secondWords = getWordSet(second);

    if (firstWords.size === 0 || secondWords.size === 0) {
      return 0;
    }

    let commonWords = 0;

    firstWords.forEach((word) => {
      if (secondWords.has(word)) {
        commonWords += 1;
      }
    });

    const totalUniqueWords = new Set([
      ...firstWords,
      ...secondWords,
    ]).size;

    return commonWords / totalUniqueWords;
  }

  function calculateMatchScore(lostItem, foundItem) {
    let score = 0;

    const sameCategory =
      normalize(lostItem.category) !== "" &&
      normalize(lostItem.category) ===
        normalize(foundItem.category);

    const titleSimilarity = similarity(
      lostItem.title,
      foundItem.title
    );

    const descriptionSimilarity = similarity(
      lostItem.description,
      foundItem.description
    );

    const locationSimilarity = similarity(
      lostItem.location,
      foundItem.location
    );

    // Category: up to 35 points.
    if (sameCategory) {
      score += 35;
    }

    // Item name: up to 40 points.
    score += titleSimilarity * 40;

    // Description: up to 15 points.
    score += descriptionSimilarity * 15;

    // Location: up to 10 points.
    score += locationSimilarity * 10;

    return Math.round(score);
  }

  function findMatches(lostItem) {
    return foundReports
      .map((foundItem) => ({
        item: foundItem,
        score: calculateMatchScore(lostItem, foundItem),
      }))
      .filter((match) => match.score >= 25)
      .sort((first, second) => second.score - first.score);
  }

  function getMatchLabel(score) {
    if (score >= 70) return "Strong match";
    if (score >= 45) return "Possible match";
    return "Weak match";
  }

  return (
    <section className="card">
      <h2>Possible Matches</h2>
      <p>
        Compare lost reports with found items. Results are ranked
        by similarities in name, category, description, and location.
      </p>

      {lostReports.length === 0 ? (
        <p>No lost reports are available yet.</p>
      ) : foundReports.length === 0 ? (
        <p>No found-item reports are available yet.</p>
      ) : (
        <div className="report-list">
          {lostReports.map((lostItem) => {
            const matches = findMatches(lostItem);

            return (
              <article className="report-item" key={lostItem._id}>
                <h3>Lost: {lostItem.title || "Untitled item"}</h3>

                <p>
                  <strong>Category:</strong>{" "}
                  {lostItem.category || "Uncategorized"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {lostItem.location || "Not specified"}
                </p>

                {matches.length > 0 ? (
                  <>
                    <h4>Ranked possible matches</h4>

                    {matches.map(({ item, score }) => (
                      <div
                        className="possible-match"
                        key={item._id}
                      >
                        <div className="report-heading">
                          <h3>{item.title || "Untitled item"}</h3>
                          <span className="tag">
                            {score}% match
                          </span>
                        </div>

                        
                        <div className="match-score-info">
                        <strong>{getMatchLabel(score)}</strong>
                        <span>{score}%</span>
                        </div>

                        <div
                        className="match-score-track"
                        role="progressbar"
                        aria-label={`Match score for ${item.title}`}
                        aria-valuenow={score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        >
                        <div
                        className="match-score-fill"
                        style={{ width: `${score}%` }}
                        />
                        </div>


                        <p>
                          <strong>Category:</strong>{" "}
                          {item.category || "Uncategorized"}
                        </p>

                        <p>
                          <strong>Location:</strong>{" "}
                          {item.location || "Not specified"}
                        </p>

                        <p>
                          <strong>Description:</strong>{" "}
                          {item.description || "No description provided"}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p>
                    No sufficiently similar found items yet. Check
                    again when new reports are submitted.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="form-hint">
        Match scores are estimates based on text similarities, not
        proof that two reports refer to the same item. Verify the
        item details before submitting a claim.
      </p>
    </section>
  );
}

export default PossibleMatches;
