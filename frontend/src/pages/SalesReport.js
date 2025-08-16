import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line
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
      const res = await axios.get(`/api/reports/sales/?year=${year}`);
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
    window.open(`/reports/sales/export/csv/?year=${year}`, '_blank');
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
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              tickFormatter={val => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip formatter={(value, name) => 
              (name === 'Conversion Rate' ? `${(value * 100).toFixed(2)}%` : value)
            } />
            <Legend />
            
            {/* First bar: Sales */}
            <Bar yAxisId="left" dataKey="total_sales" fill="#8884d8" name="Total Sales ($)" />
            
            {/* Second bar: Example Orders Count (replace with your actual field) */}
            <Bar yAxisId="left" dataKey="deals_count" fill="#ff7300" name="Deals Count" />
            
            {/* Line for conversion rate */}
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="conversion_rate" 
              stroke="#82ca9d" 
              name="Conversion Rate" 
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {!loading && data.length === 0 && <p>No data found for the selected year.</p>}
    </div>
  );
}
