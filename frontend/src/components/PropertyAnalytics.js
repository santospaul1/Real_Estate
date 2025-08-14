import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";

const PropertyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    axios.get("/api/analytics/property-analytics/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => setAnalytics(res.data))
    .catch(err => console.error(err));
  }, []);

  if (!analytics) return <p>Loading analytics...</p>;

  // Prepare data for charts
  const labels = analytics.properties.map(p => p.title);
  const inquiryData = analytics.properties.map(p => p.inquiries_count);
  const viewsData = analytics.properties.map(p => p.views);

  return (
    <div>
      <h2>Property Analytics Dashboard</h2>

      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h3>Inquiries per Property</h3>
          <Bar
            data={{
              labels,
              datasets: [{
                label: "Inquiries",
                data: inquiryData,
                backgroundColor: "rgba(75,192,192,0.6)"
              }]
            }}
          />
        </div>

        <div>
          <h3>Property Views Distribution</h3>
          <Pie
            data={{
              labels,
              datasets: [{
                label: "Views",
                data: viewsData,
                backgroundColor: [
                  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"
                ]
              }]
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Summary</h3>
        <p>Total Inquiries: {analytics.total_inquiries}</p>
        <p>Average Days on Market: {analytics.avg_days_on_market}</p>
      </div>
    </div>
  );
};

export default PropertyAnalytics;
