// src/services/propertyService.js
import api from "../api/axios";

export const getProperties = () => api.get("properties/");
export const getProperty = (id) => api.get(`properties/${id}/`);
export const createProperty = (data) => api.post("properties/", data);
export const updateProperty = (id, data) => api.put(`properties/${id}/`, data);
export const deleteProperty = (id) => api.delete(`properties/${id}/`);
export const getAgents = () => api.get("properties/agents/");

export const getInquiries = () => api.get("inquiries/");
export const getInquiry = (id) => api.get(`inquiries/${id}/`);
export const createInquiry = (data) => api.post("inquiries/", data);
export const updateInquiry = (id, data) => api.put(`inquiries/${id}/`, data);
export const deleteInquiry = (id) => api.delete(`inquiries/${id}/`);

export const getPropertyAnalytics = (id) =>
  api.get(`properties/${id}/analytics/`);
export const getPortfolioAnalytics = () =>
  api.get("analytics/properties/");
