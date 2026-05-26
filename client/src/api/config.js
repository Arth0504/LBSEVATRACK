const DEFAULT_API_BASE_URL = "/api";

function normalizeBaseUrl(value) {
  return value.trim().replace(/\/+$/, "");
}

export const apiConfig = {
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL),
};
