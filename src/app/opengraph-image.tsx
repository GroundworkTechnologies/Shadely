import { ImageResponse } from "next/og";
import { buildScales, DEFAULT_STATE } from "@/engine";
import { ogFonts } from "@/lib/og-fonts";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const brand = buildScales({ ...DEFAULT_STATE, neutral: "off", status: false })[0]!;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#ffffff", color: "#1a1a1a", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#5e5e5e" }}>{`A product of ${SITE.company}`}</div>
          <div style={{ fontSize: 96, fontWeight: 600, marginTop: 16 }}>{SITE.name}</div>
          <div style={{ fontSize: 40, color: "#5e5e5e", marginTop: 8 }}>One color in. An accessible Tailwind palette out.</div>
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
