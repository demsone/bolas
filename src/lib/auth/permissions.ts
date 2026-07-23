export const roles = ["owner", "admin", "editor"] as const;
export type Role = (typeof roles)[number];

export const capabilities = [
  "manage_users",
  "manage_site",
  "manage_security",
  "manage_content",
  "manage_media",
] as const;
export type Capability = (typeof capabilities)[number];

const permissions: Record<Role, readonly Capability[]> = {
  owner: capabilities,
  admin: ["manage_site", "manage_security", "manage_content", "manage_media"],
  editor: ["manage_content", "manage_media"],
};

export function can(role: Role, capability: Capability) {
  return permissions[role].includes(capability);
}
