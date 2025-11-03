// API Configuration for Production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-backend-for-token.onrender.com/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_PROFILE: `${API_BASE_URL}/auth/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
  
  // Logs endpoints
  GET_LOGS: `${API_BASE_URL}/logs`,
  GET_STATS: `${API_BASE_URL}/logs/stats`,
  GET_ANALYTICS: `${API_BASE_URL}/logs/analytics`,
  EXPORT_LOGS: `${API_BASE_URL}/logs/export`,
  CREATE_LOG: `${API_BASE_URL}/logs`,
  
  // AI endpoints
  PROCESS_PROMPT: `${API_BASE_URL}/ai/process`,
  GET_MODELS: `${API_BASE_URL}/ai/models`,
  GET_STATUS: `${API_BASE_URL}/ai/status`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`
};

export default API_BASE_URL;