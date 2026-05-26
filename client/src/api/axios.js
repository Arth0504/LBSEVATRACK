import axios from "axios";
import { apiConfig } from "./config";

const API = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: 60000,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.userMessage =
        "Cannot reach the API. For local development, run the server on port 5000. For hosted builds, set VITE_API_URL.";
    }
    return Promise.reject(err);
  }
);

export default API;
