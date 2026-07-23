const reservedSlugs = new Set(["admin", "api", "journal", "login", "setup"]);

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function isReservedSlug(slug: string) {
  return reservedSlugs.has(slug);
}
