function normalizeBaseUrl(value) {
  return value ? value.trim().replace(/\/+$/, "") : "";
}

const isProd = import.meta.env.PROD;
const hostname = window.location.hostname;
const defaultApi = (isProd || (hostname !== 'localhost' && hostname !== '127.0.0.1')) 
  ? "https://sevatrack-5km0.onrender.com/api" 
  : "http://localhost:5000/api";

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL 
    ? normalizeBaseUrl(import.meta.env.VITE_API_URL) 
    : defaultApi,
};
