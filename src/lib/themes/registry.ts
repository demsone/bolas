import { hearthStarterTheme } from "@/themes/hearth-starter/definition";
import type { HearthThemeDefinition } from "./contract";

const registeredThemes = [hearthStarterTheme] satisfies HearthThemeDefinition[];
const registry = new Map(registeredThemes.map((theme) => [theme.manifest.id, theme]));

if (registry.size !== registeredThemes.length) throw new Error("Bolas theme IDs must be unique.");

export const DEFAULT_THEME_ID = "bolas.editorial";

export function listRegisteredThemes() {
  return [...registeredThemes];
}

export function getRegisteredTheme(themeId: string) {
  return registry.get(themeId);
}

export function getDefaultTheme() {
  const theme = registry.get(DEFAULT_THEME_ID);
  if (!theme) throw new Error("The Bolas editorial theme is not registered.");
  return theme;
}
