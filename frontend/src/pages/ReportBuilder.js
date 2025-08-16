
import React, { useState } from 'react';

export default function ReportBuilder() {
  const [dataSource, setDataSource] = useState('sales');
  const [groupBy, setGroupBy] = useState('month');
  const [metrics, setMetrics] = useState(['total_sales']);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState(null);

  async function fetchReport() {
    const params = new URLSearchParams({
      data_source: dataSource,
      group_by: groupBy,
      metrics: metrics.join(','),
      start_date: dateRange.start,
      end_date: dateRange.end,
    });
    const res = await fetch(`http://127.0.0.1:8000/api/reports/custom-report/?${params.toString()}`);
    const json = await res.json();
    setReportData(json);
  }

  return (
    <div>
      <h2>Custom Report Builder</h2>
      {/* UI controls for selecting dataSource, groupBy, metrics, dateRange */}
      {/* Button to fetchReport */}
      <button onClick={fetchReport}>Generate Report</button>
      {reportData && (
        <table>
          {/* Render reportData as a table */}
        </table>
      )}
    </div>
  );
}
