import type { Metadata } from "next";
import { Workspace } from "@/components/workspace/workspace";
import { decodeState, DEFAULT_STATE } from "@/engine";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const state = decodeState(await searchParams);
  const custom = state.base !== DEFAULT_STATE.base;
  if (!custom) return {};
  const img = `/api/og?b=${state.base.slice(1)}&nm=${state.name}`;
  const title = `Shadely: ${state.name} Palette ${state.base}`;
  return {
    title,
    robots: { index: false, follow: true },
    openGraph: { title, images: [{ url: img, width: 1200, height: 630, alt: `${state.name} color palette ${state.base}, shades 50 to 950` }] },
    twitter: { images: [img] },
  };
}

export default async function Home({ searchParams }: Props) {
  const initial = decodeState(await searchParams);
  return <Workspace initial={initial} />;
}
