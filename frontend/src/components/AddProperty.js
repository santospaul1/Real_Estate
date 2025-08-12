import React, { useState } from "react";
import api from "../api";

export default function AddProperty() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "",
    bathrooms: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("properties/", form).then(() => {
      alert("Property added!");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" onChange={handleChange} />
      <input name="price" placeholder="Price" onChange={handleChange} />
      <input name="location" placeholder="Location" onChange={handleChange} />
      <input name="bedrooms" placeholder="Bedrooms" onChange={handleChange} />
      <input name="bathrooms" placeholder="Bathrooms" onChange={handleChange} />
      <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
      <button type="submit">Add Property</button>
    </form>
  );
}
