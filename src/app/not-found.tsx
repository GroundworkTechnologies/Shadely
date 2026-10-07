import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shadely: Page Not Found",
  description: "This page does not exist. Head back to the Shadely palette generator to turn any color into a Tailwind palette.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="page-container py-16">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-xl text-muted">That page does not exist, or it moved. You can build a palette from any color instead.</p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="rounded-control bg-primary px-4 py-2 font-medium text-primary-fg hover:bg-primary-hover">
          Open the palette generator
        </Link>
        <Link href="/tailwind-colors" className="rounded-control border border-border px-4 py-2 font-medium hover:bg-surface-hover">
          Browse Tailwind CSS default colors
        </Link>
      </div>
    </div>
  );
}
