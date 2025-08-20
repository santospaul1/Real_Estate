import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "residential",
    status: "available",
  });
  const [photos, setPhotos] = useState([]); // new uploads
  const [existingPhotos, setExistingPhotos] = useState([]); // from backend
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // --- fetch property defaults when editing ---
  useEffect(() => {
    if (id) {
      setFetching(true);
      fetch(`http://localhost:8000/api/properties/${id}/`)
        .then((res) => res.json())
        .then((res) => {
          setFormData({
            title: res.title || "",
            description: res.description || "",
            price: res.price || "",
            location: res.location || "",
            category: res.category || "residential",
            status: res.status || "available",
          });
          if (res.photos) setExistingPhotos(res.photos); // [{id, image}, ...]
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhotos([...e.target.files]);
  };

  const handleDeleteExisting = async (photoId) => {
    try {
      await fetch(`http://localhost:8000/api/photos/${photoId}/`, {
        method: "DELETE",
      });
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      console.error("Failed to delete photo", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });
    photos.forEach((file) => form.append("photos", file));

    const url = isEdit
      ? `http://localhost:8000/api/properties/${id}/`
      : "http://localhost:8000/api/properties/";

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, { method, body: form });

    setLoading(false);
    if (res.ok) {
      navigate("/properties");
    } else {
      console.error("❌ Failed to save property");
    }
  };

  if (fetching) return <p style={{ textAlign: "center" }}>⏳ Loading property data...</p>;

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "20px" }}>
        {isEdit ? "✏️ Edit Property" : "🏠 Add Property"}
      </h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          style={{ ...inputStyle, height: "100px" }}
        />

        <input
          name="price"
          placeholder="Price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="rental">Rental</option>
          <option value="sale">Sale</option>
        </select>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="available">Available</option>
          <option value="under_contract">Under Contract</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>

        <input type="file" multiple onChange={handleFileChange} style={inputStyle} />

        {/* Existing photos */}
        {existingPhotos.length > 0 && (
          <div style={thumbGrid}>
            {existingPhotos.map((photo) => (
              <div key={photo.id} style={{ position: "relative" }}>
                <img
                  src={photo.image}
                  alt="Existing"
                  style={thumbStyle}
                  onClick={() => setPreviewImage(photo.image)}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(photo.id)}
                  style={deleteBtn}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Preview new photos */}
        {photos.length > 0 && (
          <div style={thumbGrid}>
            {Array.from(photos).map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt="Preview"
                style={thumbStyle}
                onClick={() => setPreviewImage(URL.createObjectURL(file))}
              />
            ))}
          </div>
        )}

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "⏳ Saving..." : "💾 Save Property"}
        </button>
      </form>

      {/* Image Preview */}
      {previewImage && (
        <div style={modalOverlay} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" style={modalImage} />
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const containerStyle = {
  maxWidth: "600px",
  margin: "20px auto",
  padding: "25px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const inputStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "16px",
};

const buttonStyle = {
  background: "#2196F3",
  color: "#fff",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  marginTop: "10px",
};

const thumbGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "10px",
};

const thumbStyle = {
  width: "100px",
  height: "80px",
  objectFit: "cover",
  borderRadius: "6px",
  cursor: "pointer",
  border: "1px solid #ccc",
};

const deleteBtn = {
  position: "absolute",
  top: "-6px",
  right: "-6px",
  background: "red",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: "22px",
  height: "22px",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalImage = {
  maxWidth: "90%",
  maxHeight: "90%",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
};
