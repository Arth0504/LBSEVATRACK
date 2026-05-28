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
    return Promise.reject(err);
  }
);

export default API;
