import React, { useEffect, useState } from "react";
import { getProperties, deleteProperty } from "../services/propertyService";
import { Link } from "react-router-dom";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    avgPrice: 0,
    minPrice: null,
    maxPrice: null,
  });

  const fetchData = () => {
    getProperties().then((res) => {
      setProperties(res.data);

      // Analytics calculations
      if (res.data.length > 0) {
        const prices = res.data.map((p) => p.price);
        const total = res.data.length;
        const avgPrice = (prices.reduce((a, b) => a + b, 0) / total).toFixed(2);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        setAnalytics({ total, avgPrice, minPrice, maxPrice });
      } else {
        setAnalytics({ total: 0, avgPrice: 0, minPrice: null, maxPrice: null });
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Delete this property?")) {
      deleteProperty(id).then(() => fetchData());
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/properties/add"
          style={{
            background: "#4CAF50",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          + Add Property
        </Link>
      </div>

      {/* Analytics Panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div style={cardStyle}>
          <h4>Total Properties</h4>
          <p>{analytics.total}</p>
        </div>
        <div style={cardStyle}>
          <h4>Average Price</h4>
          <p>${analytics.avgPrice}</p>
        </div>
        <div style={cardStyle}>
          <h4>Cheapest</h4>
          <p>${analytics.minPrice}</p>
        </div>
        <div style={cardStyle}>
          <h4>Most Expensive</h4>
          <p>${analytics.maxPrice}</p>
        </div>
      </div>

      {/* Property Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {properties.map((p) => (
          <div key={p.id} style={cardStyle}>
            <h3>{p.title}</h3>
            <p>
              <strong>Agent:</strong> {p.agent_name}
            </p>
            <p>
              <strong>Price:</strong> ${p.price}
            </p>
            <p>
              <strong>Inquiries:</strong> {p.inquiries_count || 0}
            </p>

            {p.photos && p.photos.length > 0 && (
              <img
                src={p.photos[0].image}
                alt={p.title}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            )}

            {p.photos && p.photos.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  flexWrap: "wrap",
                }}
              >
                {p.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.image}
                    alt={p.title}
                    style={{
                      width: "70px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                  />
                ))}
              </div>
            )}

            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <Link
                to={`/properties/edit/${p.id}`}
                style={{
                  background: "#2196F3",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  textDecoration: "none",
                }}
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(p.id)}
                style={{
                  background: "red",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};
