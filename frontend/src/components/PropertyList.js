import React, { useEffect, useState } from "react";
import { getProperties, deleteProperty } from "../services/propertyService";
import { Link } from "react-router-dom";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);

  const fetchData = () => {
    getProperties().then((res) => setProperties(res.data));
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
    <div>
      <Link to="/properties/add">Add Property</Link>
      <ul>
        {properties.map((p) => (
          <li key={p.id}>
            <h3>{p.title} - {p.agent_name} - ${p.price}</h3>
            
            {/* Show first photo */}
            {p.photos && p.photos.length > 0 && (
              <img
                src={p.photos[0].image}
                alt={p.title}
                style={{ width: "150px", height: "100px", objectFit: "cover" }}
              />
            )}

            {/* Show all photos */}
            {p.photos && p.photos.length > 1 && (
              <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                {p.photos.map(photo => (
                  <img
                    key={photo.id}
                    src={photo.image}
                    alt={p.title}
                    style={{ width: "100px", height: "70px", objectFit: "cover" }}
                  />
                ))}
              </div>
            )}

            <br />
            <Link to={`/properties/edit/${p.id}`}>Edit</Link>
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
