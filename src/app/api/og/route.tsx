import { ImageResponse } from "next/og";
import { buildScales, decodeState } from "@/engine";
import { SITE } from "@/lib/site";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = decodeState(searchParams);
  const brand = buildScales({ ...state, neutral: "off", status: false })[0]!;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#fafaf9", color: "#1f1f1c" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#696761" }}>{`${SITE.name} · ${SITE.company}`}</div>
          <div style={{ fontSize: 76, fontWeight: 700, marginTop: 16 }}>{`${state.name} palette`}</div>
          <div style={{ fontSize: 34, color: "#51504b", marginTop: 8 }}>{`${state.base} · Tailwind 50–950 scale`}</div>
        </div>
        <div style={{ display: "flex", height: 220, borderRadius: 24, overflow: "hidden", border: "2px solid #dfdcd3" }}>
          {brand.steps.map((s) => (
            <div key={s.stop} style={{ flex: 1, background: s.hex, display: "flex", alignItems: "flex-end", padding: 12, fontSize: 22, color: s.stop < 500 ? "#000" : "#fff" }}>
              {s.stop}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "cache-control": "public, max-age=86400, s-maxage=604800" } },
  );
}
