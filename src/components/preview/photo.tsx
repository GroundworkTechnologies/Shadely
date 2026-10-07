import { cn } from "@/lib/cn";

/** Unsplash photos (free to use under the Unsplash License). Every id was checked to resolve. */
export const PHOTOS = {
  phone: { id: "1511707171634-5f897ff02aa9", alt: "A smartphone showing a home screen of apps" },
  analytics: { id: "1460925895917-afdab827c52f", alt: "A laptop showing an analytics dashboard" },
  payment: { id: "1563013544-824ae1b704d3", alt: "A person holding a credit card at a laptop" },
  team: { id: "1522202176988-66273c2fd55f", alt: "Three colleagues laughing together around a laptop" },
  workspace: { id: "1519389950473-47ba0277781c", alt: "A team working on laptops around a shared table" },
  highfive: { id: "1600880292203-757bb62b4baf", alt: "Two colleagues celebrating with a high five at their desk" },
  shop: { id: "1556742049-0cfed4f6a45d", alt: "A shop owner and a customer paying with a phone" },
  coding: { id: "1498050108023-c5249f4df085", alt: "A laptop with code on the screen" },
  woman1: { id: "1573496359142-b8d87734a5a2", alt: "Portrait of a smiling woman in a gray blazer" },
  man1: { id: "1507003211169-0a1dd7228f2d", alt: "Portrait of a smiling man" },
  woman2: { id: "1494790108377-be9c29b29330", alt: "Portrait of a laughing woman in a red sweater" },
} as const;

export type PhotoName = keyof typeof PHOTOS;

export function photoUrl(name: PhotoName, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${PHOTOS[name].id}?auto=format&fit=crop&crop=faces,entropy&w=${w}&h=${h}&q=70`;
}

/**
 * A lazily loaded photo. The surrounding box keeps its size and a tinted background,
 * so the layout is stable and looks fine if the image is slow or blocked.
 */
export function Photo({ name, w, h, className, decorative = false, priority = false }: { name: PhotoName; w: number; h: number; className?: string; decorative?: boolean; priority?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Unsplash's CDN already serves resized, compressed images
    <img
      src={photoUrl(name, w, h)}
      srcSet={`${photoUrl(name, w, h)} 1x, ${photoUrl(name, w * 2, h * 2)} 2x`}
      width={w}
      height={h}
      alt={decorative ? "" : PHOTOS[name].alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn("bg-(--p-soft) object-cover", className)}
    />
  );
}
