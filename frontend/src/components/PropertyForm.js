import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // detect edit mode
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "residential",
    status: "available",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch property details if editing
  useEffect(() => {
    if (isEdit) {
      fetch(`http://localhost:8000/api/properties/${id}/`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price,
            location: data.location,
            category: data.category,
            status: data.status,
          });
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhotos([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    photos.forEach((file) => {
      form.append("photos", file);
    });

    const url = isEdit
      ? `http://localhost:8000/api/properties/${id}/`
      : "http://localhost:8000/api/properties/";

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, { method, body: form });

    setLoading(false);
    if (res.ok) {
      navigate("/properties");
    } else {
      console.error("Failed to save property");
    }
  };

  return (
    <div style={containerStyle}>
      <h2>{isEdit ? "Edit Property" : "Add Property"}</h2>

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
          style={{ ...inputStyle, height: "80px" }}
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

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Saving..." : "Save Property"}
        </button>
      </form>
    </div>
  );
}

// --- Styles ---
const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "16px",
};

const buttonStyle = {
  background: "#2196F3",
  color: "#fff",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};
