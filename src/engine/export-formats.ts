// Cheap format metadata, kept apart from the generators so UI code can import it without pulling them in.

export type ExportFormat = "tailwind-v4" | "tailwind-v3" | "css" | "scss" | "json" | "dtcg" | "tokens-studio" | "shadcn" | "style-dictionary" | "css-modern" | "flutter" | "android" | "compose" | "ios";

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  "tailwind-v4": "Tailwind v4 (@theme)",
  "tailwind-v3": "Tailwind v3 (config)",
  css: "CSS variables",
  scss: "SCSS",
  json: "JSON",
  dtcg: "Design tokens (DTCG)",
  "tokens-studio": "Tokens Studio / Figma",
  shadcn: "shadcn/ui theme",
  "css-modern": "Modern CSS (light-dark)",
  "style-dictionary": "Style Dictionary",
  flutter: "Flutter (Dart)",
  android: "Android (colors.xml)",
  compose: "Jetpack Compose",
  ios: "iOS (SwiftUI)",
};

export const FORMAT_FILES: Record<ExportFormat, string> = {
  "tailwind-v4": "tintwork-theme.css",
  "tailwind-v3": "tailwind.colors.js",
  css: "tintwork-colors.css",
  scss: "_tintwork-colors.scss",
  json: "tintwork-colors.json",
  dtcg: "tintwork-tokens.json",
  "tokens-studio": "tintwork-tokens-studio.json",
  shadcn: "tintwork-shadcn-theme.css",
  "css-modern": "tintwork-modern.css",
  "style-dictionary": "tintwork-style-dictionary.json",
  flutter: "tintwork_colors.dart",
  android: "colors.xml",
  compose: "Color.kt",
  ios: "TintworkColors.swift",
};
