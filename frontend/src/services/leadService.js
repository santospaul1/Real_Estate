// src/services/leadService.js
import api from '../api/axios';

export const fetchLeads = () => api.get('leads/');
export const createLead = (payload) => api.post('leads/', payload);
export const updateLead = (id, payload) => api.put(`leads/${id}/`, payload);
export const setLeadStage = (id, stage) => api.post(`leads/${id}/set_stage/`, { stage });
export const rescoreLead = (id) => api.post(`leads/${id}/rescore/`);
export const convertLeadToClient = (id) => api.post(`leads/${id}/convert_to_client/`);
