import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildScales } from "../palettes";
import { camel, pascal, snake } from "../export-platforms";
import { exportFiles, exportScales, exportZip, type ExportFormat } from "../export";
import { crc32 } from "../zip";
import { DEFAULT_STATE } from "../state";

const full = buildScales({ ...DEFAULT_STATE, base: "#505cc6" });
const brand = full.slice(0, 1);
const run = (format: ExportFormat) => exportScales(brand, { format, syntax: "hex", full });

describe("naming helpers", () => {
  it("converts case for each platform", () => {
    expect(camel("my-brand")).toBe("myBrand");
    expect(pascal("my-brand")).toBe("MyBrand");
    expect(snake("My Brand")).toBe("my_brand");
    expect(pascal("card-foreground")).toBe("CardForeground");
  });
});

describe("platform exports", () => {
  it("Flutter has swatches and light/dark schemes without deprecated roles", () => {
    const dart = run("flutter");
    expect(dart).toContain("static const MaterialColor brand = MaterialColor(0xFF");
    expect(dart).toContain("50: Color(0xFF");
    expect(dart).toContain("950: Color(0xFF");
    expect(dart).toContain("static const ColorScheme light");
    expect(dart).toContain("brightness: Brightness.dark");
    expect(dart).not.toMatch(/^\s+(background|onBackground):/m);
    expect(dart).toMatchSnapshot();
  });
  it("Android colors.xml is well formed and complete", () => {
    const xml = run("android");
    expect(xml.match(/<color name="brand_\d+">#[0-9A-F]{6}<\/color>/g)).toHaveLength(11);
    expect(xml).toContain('<color name="tw_primary">');
    expect(xml.startsWith('<?xml version="1.0"')).toBe(true);
    expect(xml.trim().endsWith("</resources>")).toBe(true);
  });
  it("Compose has palette values and both schemes", () => {
    const kt = run("compose");
    expect(kt).toContain("val Brand500 = Color(0xFF");
    expect(kt).toContain("val TintworkLightColors = lightColorScheme(");
    expect(kt).toContain("val TintworkDarkColors = darkColorScheme(");
  });
  it("SwiftUI exposes every shade", () => {
    const swift = run("ios");
    expect(swift.match(/static let brand\d+ = Color\(hex: 0x[0-9A-F]{6}\)/g)).toHaveLength(11);
  });
  it("Style Dictionary tokens are valid DTCG-style JSON", () => {
    const json = JSON.parse(run("style-dictionary"));
    expect(json.color.brand["500"]).toEqual({ $value: expect.stringMatching(/^#[0-9a-f]{6}$/), $type: "color" });
  });
  it("modern CSS has hex fallback, OKLCH and light-dark()", () => {
    const css = run("css-modern");
    expect(css).toContain("--brand-500: #");
    expect(css).toContain("@supports (color: oklch(0% 0 0))");
    expect(css).toMatch(/--primary: light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\);/);
  });
  it("degrades without a full set (no semantic sections, no throw)", () => {
    for (const f of ["flutter", "android", "compose", "ios", "css-modern"] as const) {
      expect(() => exportScales(brand, { format: f, syntax: "hex" })).not.toThrow();
    }
    expect(exportScales(brand, { format: "flutter", syntax: "hex" })).not.toContain("TintworkSchemes");
  });
});

describe("export bundle", () => {
  const files = exportFiles(brand, { syntax: "oklch", full, sourceUrl: "https://x.test/?v=1" });
  it("contains every format in a sensible tree", () => {
    const paths = files.map((f) => f.path);
    for (const p of ["tailwind/theme.css", "tailwind/tailwind.config.js", "css/modern.css", "css/shadcn-theme.css", "flutter/tintwork_colors.dart", "android/values/colors.xml", "android/values-night/colors.xml", "ios/TintworkColors.swift", "ios/Tintwork.xcassets/Contents.json", "tokens/style-dictionary/config.json", "README.md"]) {
      expect(paths, p).toContain(p);
    }
    expect(new Set(paths).size).toBe(paths.length);
  });
  it("asset catalog colorsets carry light and dark appearances for semantic colors", () => {
    const f = files.find((x) => x.path.endsWith("TwPrimary.colorset/Contents.json"))!;
    const json = JSON.parse(f.content as string);
    expect(json.colors).toHaveLength(2);
    expect(json.colors[1].appearances[0]).toEqual({ appearance: "luminosity", value: "dark" });
    expect(Number(json.colors[0].color.components.red)).toBeGreaterThanOrEqual(0);
  });
  it("every file is non-empty and the tailwind v3 file uses hex", () => {
    for (const f of files) expect((f.content as string).length, f.path).toBeGreaterThan(10);
    expect(files.find((x) => x.path === "tailwind/tailwind.config.js")!.content).toContain("'#");
  });
});

describe("zip writer", () => {
  const zip = exportZip(brand, { syntax: "hex", full });
  it("has a valid end-of-central-directory record and matching entry count", () => {
    const dv = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    const eocd = zip.length - 22;
    expect(dv.getUint32(eocd, true)).toBe(0x06054b50);
    expect(dv.getUint16(eocd + 10, true)).toBe(exportFiles(brand, { syntax: "hex", full }).length);
  });
  it("crc32 matches the known check value", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
  it("is readable by a real unzip implementation", () => {
    let py = "";
    try {
      py = execFileSync("python3", ["--version"]).toString();
    } catch {
      return; // python not available: skip the external check
    }
    expect(py).toContain("Python");
    const dir = mkdtempSync(path.join(os.tmpdir(), "tw-zip-"));
    const file = path.join(dir, "t.zip");
    writeFileSync(file, zip);
    const out = execFileSync("python3", ["-c", "import sys,zipfile;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip() or 'OK', len(z.namelist()))", file]).toString().trim();
    expect(out.startsWith("OK ")).toBe(true);
  });
});
