// src/services/communicationService.js
import api from "../api/axios";

// List + create
export const getCommunications = () => api.get("communications/");
export const sendCommunication = (data) => api.post("communications/", data);

// Special endpoints
export const replyToClient = (clientId, message) =>
  api.post(`communications/reply-to-client/${clientId}/`, { message });

export const replyToAgent = (agentId, message) =>
  api.post(`communications/reply-to-agent/${agentId}/`, { message });

export const messageAdmin = (message) =>
  api.post("communications/message-admin/", { message });
