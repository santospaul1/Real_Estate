// src/components/ClientDashboard.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ClientDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    avgPrice: 0,
    minPrice: 0,
    maxPrice: 0,
  });

  useEffect(() => {
    // Fetch properties
    fetch("/api/properties/")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);

        if (data.length > 0) {
          const prices = data.map((p) => p.price);
          const total = data.length;
          const avgPrice = (prices.reduce((a, b) => a + b, 0) / total).toFixed(
            2
          );
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);

          setAnalytics({
            total,
            avgPrice,
            minPrice,
            maxPrice,
          });
        }
      })
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    fetch(`/api/properties/${id}/`, { method: "DELETE" })
      .then(() => {
        setProperties(properties.filter((p) => p.id !== id));
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#2c3e50",
          color: "#ecf0f1",
          padding: "20px",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: "20px" }}>Client Panel</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <Link to="/client/dashboard" style={linkStyle}>
                🏠 Dashboard
              </Link>
            </li>
            
            <li>
              <Link to="/communications" style={linkStyle}>
                💬 Messages
              </Link>
            </li>
            <li>
              <Link to="/client" style={linkStyle}>
                👤 Profile
              </Link>
            </li>
            <li>
              <Link to="/logout" style={linkStyle}>
                🔐 Logout
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, background: "#f5f6fa", padding: "20px" }}>
        <h1>Available Properties</h1>

        
       
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
                <strong>Price:</strong> ${p.price}
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


            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const linkStyle = {
  color: "#ecf0f1",
  textDecoration: "none",
  display: "block",
  padding: "10px 0",
};

const cardStyle = {
  background: "#fff",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

export default ClientDashboard;
