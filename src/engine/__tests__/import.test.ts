import { describe, expect, it } from "vitest";
import { extractBaseColor } from "../import";

describe("extractBaseColor", () => {
  it("reads the 500 shade from a v4 @theme block", () => {
    expect(extractBaseColor("@theme {\n --color-brand-400: #111111;\n --color-brand-500: oklch(62.3% 0.214 259.8);\n}")).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("reads a v3 config", () => {
    expect(extractBaseColor("colors: { brand: { 100: '#eeeeee', 500: '#3b82f6', 900: '#111111' } }")).toBe("#3b82f6");
  });
  it("falls back to 600, then the middle shade, then any color", () => {
    expect(extractBaseColor("--a-600: #ff0000; --a-100: #00ff00;")).toBe("#ff0000");
    expect(extractBaseColor("--a-100: #00ff00; --a-300: #0000ff; --a-900: #000000;")).toBe("#0000ff");
    expect(extractBaseColor("my color is #505cc6 ok")).toBe("#505cc6");
  });
  it("returns null for text without colors", () => {
    expect(extractBaseColor("hello world 500")).toBeNull();
  });
});
