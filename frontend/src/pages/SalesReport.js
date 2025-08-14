import React, { useState, useEffect } from 'react';
import api from '../api/axios';  // Your axios instance with auth
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function SalesReport() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await api.get(`/reports/sales/?year=${year}`);
      setData(res.data);
    } catch (err) {
      alert('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [year]);

  function handleExportCSV() {
    window.open(`/api/reports/sales/export/csv/?year=${year}`, '_blank');
  }

  return (
    <div>
      <h2>Sales Report - {year}</h2>

      <label>
        Select Year:{' '}
        <DatePicker
          selected={new Date(year, 0, 1)}
          onChange={date => setYear(date.getFullYear())}
          showYearPicker
          dateFormat="yyyy"
        />
      </label>

      <button onClick={handleExportCSV} style={{ marginLeft: 20 }}>
        Export CSV
      </button>

      {loading && <p>Loading...</p>}

      {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              tickFormatter={val => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip formatter={(value, name) => (name === 'conversion_rate' ? `${value * 100}%` : value)} />
            <Legend />
            <Bar yAxisId="left" dataKey="total_sales" fill="#8884d8" name="Total Sales ($)" />
            <Bar yAxisId="right" dataKey="conversion_rate" fill="#82ca9d" name="Conversion Rate" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {!loading && data.length === 0 && <p>No data found for the selected year.</p>}
    </div>
  );
}
