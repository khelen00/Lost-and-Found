
import { useEffect, useState } from "react";

function ReportForm({ page, onSubmit, submitting, setPage }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formError, setFormError] = useState("");

  const isLost = page === "Report Lost";

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setFormError("");

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("The image must be 5 MB or smaller.");
      event.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    try {
      await onSubmit({
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        type: isLost ? "Lost" : "Found",
        imageFile,
      });

      setTitle("");
      setCategory("Electronics");
      setLocation("");
      setDescription("");
      setImageFile(null);

      const imageInput = document.getElementById("item-image");
      if (imageInput) imageInput.value = "";
    } catch (error) {
      setFormError(error.message || "Could not submit your report.");
    }
  }

  return (
    <section className="card form-card">
      <h2>{isLost ? "Report a Lost Item" : "Report a Found Item"}</h2>

      {formError && (
        <p className="error-message" role="alert">
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="item-title">Item name</label>
        <input
          id="item-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Black headphones"
          required
        />

        <label htmlFor="item-category">Category</label>
        <select
          id="item-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        >
          {[
            "Electronics",
            "ID Card",
            "Books",
            "Bags",
            "Bottle",
            "Clothing",
            "Keys",
            "Accessories",
            "Wallet",
            "Other",
          ].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="item-location">
          {isLost ? "Where did you lose it?" : "Where did you find it?"}
        </label>
        <input
          id="item-location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="e.g. Library, Block A"
          required
        />

        <label htmlFor="item-description">Description</label>
        <textarea
          id="item-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the item"
          required
        />

        <label htmlFor="item-image">Item photo (optional)</label>
        <input
          id="item-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
        />
        <p className="form-hint">JPG, PNG, or WebP. Maximum size: 5 MB.</p>

        {imagePreview && (
          <div className="image-preview">
            <img
              src={imagePreview}
              alt="Preview of the selected item"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "240px",
                objectFit: "contain",
                borderRadius: "8px",
                marginTop: "12px",
              }}
            />
            <button
              className="secondary"
              type="button"
              onClick={() => {
                setImageFile(null);
                const input = document.getElementById("item-image");
                if (input) input.value = "";
              }}
            >
              Remove Photo
            </button>
          </div>
        )}

        <div className="form-actions">
          <button
            className={isLost ? "blue" : "green"}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>

          <button
            className="secondary"
            type="button"
            onClick={() => setPage("Dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default ReportForm;
