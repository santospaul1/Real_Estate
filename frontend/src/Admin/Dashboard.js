import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const Dashboard = () => {
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    axios.get("/api/inquiries/") // Adjust to your Django API endpoint
      .then(res => setInquiries(res.data))
      .catch(err => console.error(err));
  }, []);

  // Example: Count inquiries per property
  const propertyNames = [...new Set(inquiries.map(i => i.property_detail.title))];
  const inquiryCounts = propertyNames.map(
    name => inquiries.filter(i => i.property_detail.title === name).length
  );

  const barData = {
    labels: propertyNames,
    datasets: [
      {
        label: "Inquiries per Property",
        data: inquiryCounts,
        backgroundColor: "rgba(75,192,192,0.6)"
      }
    ]
  };

  return (
    <div>
      <h2>Property Inquiry Analytics</h2>
      <Bar data={barData} />
    </div>
  );
};

export default Dashboard;
