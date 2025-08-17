// src/services/propertyService.js
import axios from "axios";

const API_URL = "http://localhost:8000/api/";

// ✅ Helper to add auth headers
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

// ------------------- PROPERTIES -------------------
export const getProperties = () =>
  axios.get(`${API_URL}properties/`, authHeader());

export const getProperty = (id) =>
  axios.get(`${API_URL}properties/${id}/`, authHeader());

export const createProperty = (data) =>
  axios.post(`${API_URL}properties/`, data, authHeader());

export const updateProperty = (id, data) =>
  axios.put(`${API_URL}properties/${id}/`, data, authHeader());

export const deleteProperty = (id) =>
  axios.delete(`${API_URL}properties/${id}/`, authHeader());

export const getAgents = () =>
  axios.get(`${API_URL}properties/agents/`, authHeader());

// ------------------- INQUIRIES -------------------
export const getInquiries = () =>
  axios.get(`${API_URL}inquiries/`, authHeader());

export const getInquiry = (id) =>
  axios.get(`${API_URL}inquiries/${id}/`, authHeader());

export const createInquiry = (data) =>
  axios.post(`${API_URL}inquiries/`, data, authHeader());

export const updateInquiry = (id, data) =>
  axios.put(`${API_URL}inquiries/${id}/`, data, authHeader());

export const deleteInquiry = (id) =>
  axios.delete(`${API_URL}inquiries/${id}/`, authHeader());

// ------------------- PROPERTY ANALYTICS -------------------
// Example: visits, views, leads per property
export const getPropertyAnalytics = (propertyId) =>
  axios.get(`${API_URL}properties/${propertyId}/analytics/`, authHeader());

// Example: overall portfolio stats
export const getPortfolioAnalytics = () =>
  axios.get(`${API_URL}analytics/properties/`, authHeader());
