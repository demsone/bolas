import { defineTheme } from "@/lib/themes/contract";
import { StarterHomeTemplate } from "./home-template";
import { StarterJournalTemplate } from "./journal-template";
import { StarterPageTemplate } from "./page-template";
import { StarterPostTemplate } from "./post-template";

export const hearthStarterTheme = defineTheme({
  schemaVersion: 1,
  id: "bolas.editorial",
  name: "Bolas Editorial",
  description: "A fixed editorial magazine theme for Bolas stories and long-form articles.",
  version: "1.0.0",
  author: "Bolas",
  templates: ["home", "page", "post", "journal"],
  tokens: {
    colors: {
      canvas: "#e9ece8",
      surface: "#fbfbf8",
      text: "#151816",
      muted: "#606862",
      line: "#d9ded7",
      accent: "#b43e2d",
    },
    typography: {
      display: "Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif",
      body: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif",
      utility: "Geist Mono, Geist Mono Fallback, ui-monospace, monospace",
    },
    layout: {
      readingWidth: "48rem",
      shellWidth: "72rem",
    },
  },
}, {
  Home: StarterHomeTemplate,
  Page: StarterPageTemplate,
  Post: StarterPostTemplate,
  Journal: StarterJournalTemplate,
});
