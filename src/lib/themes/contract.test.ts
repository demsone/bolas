import { describe, expect, it } from "vitest";
import { hearthStarterTheme } from "@/themes/hearth-starter/definition";
import { defineTheme } from "./contract";

const templates = hearthStarterTheme.templates;

describe("theme contract", () => {
  it("registers the starter theme with all public templates", () => {
    expect(hearthStarterTheme.manifest.templates).toEqual(["home", "page", "post", "journal"]);
    expect(hearthStarterTheme.manifest.tokens.colors.accent).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("rejects incomplete or repeated template declarations", () => {
    expect(() => defineTheme({
      ...hearthStarterTheme.manifest,
      id: "test.incomplete",
      templates: ["home", "page", "page", "journal"],
    }, templates)).toThrow();
  });
});
