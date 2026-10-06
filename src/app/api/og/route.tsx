import { ImageResponse } from "next/og";
import { bestText, buildScales, decodeState } from "@/engine";
import { ogFonts } from "@/lib/og-fonts";
import { SITE } from "@/lib/site";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = decodeState(searchParams);
  const brand = buildScales({ ...state, neutral: "off", status: false })[0]!;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#ffffff", color: "#1a1a1a", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#5e5e5e" }}>{`${SITE.name} · ${SITE.company}`}</div>
          <div style={{ fontSize: 76, fontWeight: 600, marginTop: 16 }}>{`${state.name} palette`}</div>
          <div style={{ fontSize: 34, color: "#5e5e5e", marginTop: 8 }}>{`${state.base} · Tailwind 50–950 scale`}</div>
        </div>
        <div style={{ display: "flex", height: 220, borderRadius: 24, overflow: "hidden", border: "1px solid #e8e8e8" }}>
          {brand.steps.map((s) => (
            <div key={s.stop} style={{ flex: 1, background: s.hex, display: "flex", alignItems: "flex-end", padding: 12, fontSize: 22, color: bestText(s.hex).color }}>
              {s.stop}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await ogFonts(), headers: { "cache-control": "public, max-age=86400, s-maxage=604800" } },
  );
}
