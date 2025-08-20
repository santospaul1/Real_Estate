import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSales();
  }, [period, year]);

  const fetchSales = () => {
    axios
      .get(`/api/reports/sales/?period=${period}&year=${year}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      })
      .then((res) => setSales(res.data))
      .catch((err) => console.error(err));
  };

  // ✅ CSV Export
  const downloadCSV = () => {
    const headers = ["Period", "Total Sales", "Deals Count", "Conversion Rate"];
    const rows = sales.map((s) => [
      s.period,
      s.total_sales,
      s.deals_count,
      s.conversion_rate,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "sales_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ PDF Export
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 10);

    autoTable(doc, {
      head: [["Period", "Total Sales", "Deals Count", "Conversion Rate"]],
      body: sales.map((s) => [
        s.period,
        s.total_sales,
        s.deals_count,
        s.conversion_rate,
      ]),
    });

    doc.save("sales_report.pdf");
  };

  // ✅ Excel Export
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, "sales_report.xlsx");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sales Report</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="month">Monthly</option>
          <option value="quarter">Quarterly</option>
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Export buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={downloadCSV}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Download CSV
        </button>
        <button
          onClick={downloadPDF}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Download PDF
        </button>
        <button
          onClick={downloadExcel}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Download Excel
        </button>
      </div>

      {/* Data Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Period</th>
            <th>Total Sales</th>
            <th>Deals Count</th>
            <th>Conversion Rate</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, idx) => (
            <tr key={idx} className="border-t">
              <td>{s.period}</td>
              <td>${s.total_sales.toLocaleString()}</td>
              <td>{s.deals_count}</td>
              <td>{(s.conversion_rate * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport;
