export function getSiteOrigin() {
  const configured = process.env.PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  try {
    const url = new URL(configured);
    return url.origin;
  } catch {
    return "http://localhost:3000";
  }
}
