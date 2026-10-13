
import { useState } from "react";
import ReportCard from "../components/ReportCard";

function BrowseFoundItems({ reports, onSelectItem, user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const foundItems = reports.filter(
    (report) => report.type === "Found"
  );

  const categories = [
    ...new Set(
      foundItems
        .map((report) =>
          typeof report.category === "string"
            ? report.category.trim()
            : ""
        )
        .filter(Boolean)
    ),
  ].sort();

  function isOwnReport(report) {
    const ownerId =
      typeof report.userId === "object"
        ? report.userId?._id
        : report.userId;

    return ownerId?.toString() === user?.id?.toString();
  }

  function matchesSearch(report) {
    const searchableText = [
      report.itemName,
      report.title,
      report.name,
      report.description,
      report.itemDescription,
      report.location,
      report.category,
    ]
      .filter(
        (value) =>
          typeof value === "string" ||
          typeof value === "number"
      )
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm.trim().toLowerCase());
  }

  const filteredItems = foundItems.filter((item) => {
    const itemCategory =
      typeof item.category === "string"
        ? item.category.trim()
        : "";

    const matchesCategory =
      selectedCategory === "All" ||
      itemCategory === selectedCategory;

    return matchesSearch(item) && matchesCategory;
  });

  return (
    <section className="card">
      <h2>Browse Found Items</h2>
      <p>Search for an item you believe belongs to you.</p>

      <div className="form-group">
        <label htmlFor="found-item-search">
          Search items
        </label>
        <input
          id="found-item-search"
          type="text"
          placeholder="Search by name, description, or location..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="found-item-category">
          Filter by category
        </label>
        <select
          id="found-item-category"
          value={selectedCategory}
          onChange={(event) =>
            setSelectedCategory(event.target.value)
          }
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <p>
        Showing {filteredItems.length} of {foundItems.length} found items.
      </p>

      {foundItems.length === 0 ? (
        <p>No found items have been reported yet.</p>
      ) : filteredItems.length === 0 ? (
        <p>
          No items match your search. Try another keyword or category.
        </p>
      ) : (
        <div className="report-list">
          {filteredItems.map((item) => (
            <ReportCard
              key={item._id}
              report={item}
              actions={
                <button
                  className="green"
                  disabled={isOwnReport(item)}
                  onClick={() => onSelectItem(item)}
                >
                  {isOwnReport(item)
                    ? "Your Report"
                    : "Claim This Item"}
                </button>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default BrowseFoundItems;
