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
  "tailwind-v4": "shadely-theme.css",
  "tailwind-v3": "tailwind.colors.js",
  css: "shadely-colors.css",
  scss: "_shadely-colors.scss",
  json: "shadely-colors.json",
  dtcg: "shadely-tokens.json",
  "tokens-studio": "shadely-tokens-studio.json",
  shadcn: "shadely-shadcn-theme.css",
  "css-modern": "shadely-modern.css",
  "style-dictionary": "shadely-style-dictionary.json",
  flutter: "shadely_colors.dart",
  android: "colors.xml",
  compose: "Color.kt",
  ios: "ShadelyColors.swift",
};
