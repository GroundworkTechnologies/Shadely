import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { THEME_SCRIPT } from "@/components/site/theme-toggle";
import { PAGES } from "@/lib/seo";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: PAGES.home.title,
  description: PAGES.home.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.company, url: SITE.companyUrl }],
  creator: SITE.company,
  publisher: SITE.company,
  keywords: ["Tailwind color palette generator", "Tailwind CSS colors", "OKLCH color scales", "WCAG contrast checker", "shadcn/ui theme generator", "design tokens"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_US", title: PAGES.home.title, description: PAGES.home.description, url: "/" },
  twitter: { card: "summary_large_image", title: PAGES.home.title, description: PAGES.home.description },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    description: PAGES.home.description,
    url: SITE.url,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    inLanguage: "en",
    isAccessibleForFree: true,
    codeRepository: SITE.repoUrl,
    license: "https://opensource.org/license/mit",
    featureList: [
      "OKLCH color scales from 50 to 950",
      "WCAG 2.2 and APCA contrast checks",
      "Live preview on real interface layouts in light and dark",
      "Export to Tailwind v4, Tailwind v3, CSS, SCSS, design tokens, shadcn/ui, Flutter, Android and iOS",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.company, url: SITE.companyUrl },
  },
  { "@context": "https://schema.org", "@type": "Organization", name: SITE.company, url: SITE.companyUrl, brand: { "@type": "Brand", name: SITE.name } },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="flex h-dvh flex-col overflow-hidden">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-control focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-fg">
          Skip to main content
        </a>
        <Header />
        <main id="main" className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
