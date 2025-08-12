import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PropertyForm({ isEdit }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (isEdit && id) {
      fetch(`http://localhost:8000/api/properties/${id}/`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price,
          });
        });
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhotos([...e.target.files]); // store multiple files
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("price", formData.price);

    photos.forEach((file) => {
      form.append("photos", file); // backend expects "photos"
    });

    const url = isEdit
      ? `http://localhost:8000/api/properties/${id}/`
      : "http://localhost:8000/api/properties/";

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      body: form,
    });

    if (res.ok) {
      navigate("/properties");
    } else {
      console.error("Error saving property");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isEdit ? "Edit" : "Add"} Property</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <br />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <br />
        <input
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          type="number"
          required
        />
        <br />
        <input type="file" multiple onChange={handleFileChange} />
        <br />
        <button type="submit">{isEdit ? "Update" : "Add"} Property</button>
      </form>
    </div>
  );
}
