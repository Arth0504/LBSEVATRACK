function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function getConfiguredBaseUrl() {
  const configured = process.env.SERVER_PUBLIC_URL || process.env.PUBLIC_API_URL || "";
  return configured.trim() ? trimTrailingSlash(configured.trim()) : "";
}

function getRequestBaseUrl(req) {
  const configured = getConfiguredBaseUrl();
  if (configured) return configured;

  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol || "http";
  const host = forwardedHost || req.get("host");

  return host ? `${protocol}://${host}` : "";
}

function getPublicUploadUrl(req, filename) {
  const baseUrl = getRequestBaseUrl(req);
  return baseUrl ? `${baseUrl}/uploads/${filename}` : `/uploads/${filename}`;
}

module.exports = {
  getPublicUploadUrl,
};
