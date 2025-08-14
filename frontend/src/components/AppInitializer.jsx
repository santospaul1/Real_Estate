// src/components/AppInitializer.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function AppInitializer({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");

    async function refreshAccessToken() {
      if (refreshToken) {
        try {
          const res = await axios.post("http://localhost:8000/api/token/refresh/", {
            refresh: refreshToken,
          });
          localStorage.setItem("access_token", res.data.access);
        } catch (err) {
          console.error("Token refresh failed:", err);
          // If refresh fails, remove tokens and force login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setLoading(false);
    }

    refreshAccessToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}
