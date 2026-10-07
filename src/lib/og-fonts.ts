import { readFile } from "node:fs/promises";
import path from "node:path";

const FONT_DIR = path.join(process.cwd(), "src/assets/fonts");

/** Inter for generated OG images (Satori needs raw font data, not next/font). */
export async function ogFonts() {
  const [regular, medium, semibold] = await Promise.all(
    ["400", "500", "600"].map((w) => readFile(path.join(FONT_DIR, `inter-${w}.woff`))),
  );
  const toBuffer = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
  return [
    { name: "Inter", data: toBuffer(regular!), weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: toBuffer(medium!), weight: 500 as const, style: "normal" as const },
    { name: "Inter", data: toBuffer(semibold!), weight: 600 as const, style: "normal" as const },
  ];
}
