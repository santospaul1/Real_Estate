// src/api/inquiryService.js
const API = "http://localhost:8000/api/inquiries"; // adjust if different

// Create Inquiry (public)
export async function createInquiry(inquiryData) {
  const res = await fetch(`${API}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiryData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to send inquiry");
  return data;
}

// List inquiries (requires login)
export async function listInquiries() {
  const token = localStorage.getItem("access");
  const res = await fetch(`${API}/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch inquiries");
  return data;
}
