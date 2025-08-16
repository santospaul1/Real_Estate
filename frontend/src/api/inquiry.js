// src/api/inquiry.js
const API = "http://localhost:8000/api/inquiries"; // update to your backend URL

// Create a new inquiry (open for anyone)
export async function createInquiry({ property, name, email, phone, message }) {
  const res = await fetch(`${API}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      property,
      name,
      email,
      phone,
      message
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to submit inquiry");
  return data;
}

// List inquiries (requires authentication)
export async function getInquiries() {
  const token = localStorage.getItem("access");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API}/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch inquiries");
  return data;
}

// Get a single inquiry (requires authentication)
export async function getInquiry(id) {
  const token = localStorage.getItem("access");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API}/${id}/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch inquiry");
  return data;
}
