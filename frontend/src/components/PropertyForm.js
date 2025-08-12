import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PropertyForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "residential",
    status: "available"
  });
  const [photos, setPhotos] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhotos([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    photos.forEach((file) => {
      form.append("photos", file);
    });

    const res = await fetch("http://localhost:8000/api/properties/", {
      method: "POST",
      body: form
    });

    if (res.ok) {
      navigate("/properties");
    } else {
      console.error("Failed to add property");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <br />
        <textarea name="description" placeholder="Description" onChange={handleChange} />
        <br />
        <input name="price" placeholder="Price" type="number" onChange={handleChange} required />
        <br />
        <input name="location" placeholder="Location" onChange={handleChange} required />
        <br />
        <select name="category" onChange={handleChange}>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="rental">Rental</option>
          <option value="sale">Sale</option>
        </select>
        <br />
        <select name="status" onChange={handleChange}>
          <option value="available">Available</option>
          <option value="under_contract">Under Contract</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
        <br />
        <input type="file" multiple onChange={handleFileChange} />
        <br />
        <button type="submit">Save Property</button>
      </form>
    </div>
  );
}
