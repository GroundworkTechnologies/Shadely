import type { Metadata } from "next";
import { SavedList } from "@/components/workspace/saved-list";

export const metadata: Metadata = {
  title: "Saved palettes",
  description: "Palettes you saved in this browser. Nothing leaves your device.",
  robots: { index: false },
  alternates: { canonical: "/palettes" },
};

export default function PalettesPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-10">
      <h1 className="text-3xl font-normal">Saved palettes</h1>
      <p className="mt-2 text-muted">Stored in this browser only. Export a backup file to move them to another device.</p>
      <SavedList />
    </div>
  );
}
