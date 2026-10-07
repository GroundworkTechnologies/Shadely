import type { Metadata } from "next";
import { PAGES } from "@/lib/seo";
import { SavedList } from "@/components/workspace/saved-list";

const P = PAGES.palettes;
export const metadata: Metadata = { title: P.title, description: P.description, robots: { index: false }, alternates: { canonical: P.path } };

export default function PalettesPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-10">
      <h1 className="text-3xl font-normal">Your saved palettes</h1>
      <p className="mt-2 text-muted">Your saved palettes are stored in this browser only. Download a backup file to move them to another device.</p>
      <SavedList />
    </div>
  );
}
