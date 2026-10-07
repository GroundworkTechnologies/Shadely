import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { buildScales, DEFAULT_STATE } from "@/engine";
import { ogFonts } from "@/lib/og-fonts";
import { SITE } from "@/lib/site";

export const alt = "Shadely: one color in, an accessible Tailwind palette out";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const mark = `data:image/svg+xml;base64,${(await readFile(path.join(process.cwd(), "public/brand/shadely-mark.svg"))).toString("base64")}`;
  const brand = buildScales({ ...DEFAULT_STATE, neutral: "off", status: false })[0]!;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#ffffff", color: "#1a1a1a", fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#5e5e5e" }}>{`A product of ${SITE.company}`}</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
            <img src={mark} width={96} height={96} alt="" />
            <div style={{ fontSize: 96, fontWeight: 600, marginLeft: 28 }}>{SITE.name}</div>
          </div>
          <div style={{ fontSize: 40, color: "#5e5e5e", marginTop: 8 }}>One color in. A Tailwind palette that passes contrast out.</div>
        </div>
        <div style={{ display: "flex", height: 200, borderRadius: 24, overflow: "hidden" }}>
          {brand.steps.map((s) => (
            <div key={s.stop} style={{ flex: 1, background: s.hex }} />
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
