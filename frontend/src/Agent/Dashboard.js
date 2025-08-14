import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await api.get('dashboard/agent-performance/');
        setData(res.data);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1>Agent Performance Dashboard</h1>
      {loading && <p>Loading data...</p>}
      {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="username" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="deals_closed" fill="#8884d8" name="Deals Closed" />
            <Bar yAxisId="right" dataKey="total_commission" fill="#82ca9d" name="Total Commission ($)" />
          </BarChart>
        </ResponsiveContainer>
      )}
      {!loading && data.length === 0 && <p>No data available</p>}
    </div>
  );
}
