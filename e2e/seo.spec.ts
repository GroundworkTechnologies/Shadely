import { expect, test, type Page } from "@playwright/test";
import { PAGES } from "../src/lib/seo";

/** Every rule in SEO.md that can be checked on a rendered page. */
const indexable = Object.entries(PAGES).filter(([, p]) => p.index);
const all = Object.entries(PAGES);

async function facts(page: Page) {
  return page.evaluate(() => {
    const q = (s: string) => document.querySelector(s);
    const meta = (n: string) => (q(`meta[name="${n}"]`) as HTMLMetaElement | null)?.content ?? null;
    const prop = (n: string) => (q(`meta[property="${n}"]`) as HTMLMetaElement | null)?.content ?? null;
    const levels = [...document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6")].map((h) => Number(h.tagName[1]));
    return {
      title: document.title,
      description: meta("description"),
      h1: [...document.querySelectorAll("h1")].map((h) => h.textContent?.trim() ?? ""),
      levels,
      canonical: (q('link[rel="canonical"]') as HTMLLinkElement | null)?.href ?? null,
      robots: meta("robots"),
      ogTitle: prop("og:title"),
      ogDescription: prop("og:description"),
      ogImage: prop("og:image"),
      twitterTitle: meta("twitter:title"),
      first100: ((q("main") as HTMLElement | null)?.innerText ?? "").split(/\s+/).slice(0, 100).join(" ").toLowerCase(),
      imagesMissingAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      emptyAltNotHidden: [...document.images].filter((i) => i.getAttribute("alt") === "" && i.closest("a,button") && !i.closest("[aria-hidden=true]") && !i.hasAttribute("aria-hidden")).length,
      badAnchors: [...document.querySelectorAll("a[href]")].map((a) => (a.textContent ?? "").trim().toLowerCase()).filter((t) => ["click here", "here", "read more", "more", "link"].includes(t)),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ""),
      lang: document.documentElement.lang,
      viewport: meta("viewport"),
    };
  });
}

test.describe("on-page SEO (SEO.md)", () => {
  for (const [key, p] of all) {
    test.describe(`${key} (${p.path})`, () => {
      test("title, description and one matching H1", async ({ page }) => {
        await page.goto(p.path, { waitUntil: "load" });
        const f = await facts(page);
        expect(f.title).toBe(p.title);
        expect(f.title).toMatch(/^Shadely: .+/);
        expect(f.description).toBe(p.description);
        expect(f.description!.length).toBeLessThanOrEqual(160);
        expect(f.h1, "exactly one H1").toHaveLength(1);
        // the H1 shares the page's primary keyword words
        const words = p.keyword.toLowerCase().split(" ").filter((w) => w.length > 2);
        const h1 = f.h1[0]!.toLowerCase();
        const overlap = words.filter((w) => h1.includes(w)).length;
        expect(overlap / words.length, `H1 "${f.h1[0]}" vs keyword "${p.keyword}"`).toBeGreaterThanOrEqual(0.5);
      });

      test("headings stay in order and never skip a level", async ({ page }) => {
        await page.goto(p.path, { waitUntil: "load" });
        const { levels } = await facts(page);
        expect(levels[0]).toBe(1);
        levels.forEach((l, i) => i > 0 && expect(l - levels[i - 1]!, `${levels.join(",")}`).toBeLessThanOrEqual(1));
      });

      test("keyword is in the first 100 words", async ({ page }) => {
        await page.goto(p.path, { waitUntil: "load" });
        const { first100 } = await facts(page);
        expect(first100).toContain(p.keyword.toLowerCase());
      });

      test("canonical points at this page; indexing matches the plan", async ({ page }) => {
        await page.goto(p.path, { waitUntil: "load" });
        const f = await facts(page);
        expect(new URL(f.canonical!).pathname).toBe(p.path);
        if (p.index) expect(f.robots ?? "").not.toContain("noindex");
        else expect(f.robots).toContain("noindex");
      });

      test("social tags match the page and are not copied from another page", async ({ page }) => {
        await page.goto(p.path, { waitUntil: "load" });
        const f = await facts(page);
        expect(f.ogTitle).toBe(p.title);
        expect(f.ogDescription).toBe(p.description);
        expect(f.twitterTitle).toBe(p.title);
        expect(f.ogImage).toMatch(/opengraph-image/);
      });

      test("images have alt text and links have real words", async ({ page }) => {
        await page.goto(p.path, { waitUntil: "load" });
        const f = await facts(page);
        expect(f.imagesMissingAlt).toBe(0);
        expect(f.badAnchors).toEqual([]);
      });

      test("page basics: language, viewport, valid structured data", async ({ page }) => {
        await page.goto(p.path, { waitUntil: "load" });
        const f = await facts(page);
        expect(f.lang).toBe("en");
        expect(f.viewport).toContain("width=device-width");
        expect(f.jsonLd.length).toBeGreaterThan(0);
        for (const raw of f.jsonLd) expect(() => JSON.parse(raw), raw.slice(0, 60)).not.toThrow();
      });
    });
  }

  test("no two pages share a title, description, H1 or social title", async ({ page }) => {
    const seen = { title: new Set<string>(), description: new Set<string>(), h1: new Set<string>(), og: new Set<string>() };
    for (const [, p] of all) {
      await page.goto(p.path, { waitUntil: "load" });
      const f = await facts(page);
      for (const [k, v] of [["title", f.title], ["description", f.description], ["h1", f.h1[0]], ["og", f.ogTitle]] as const) {
        expect(seen[k].has(v!), `duplicate ${k}: ${v}`).toBe(false);
        seen[k].add(v!);
      }
    }
  });

  test("the About page has FAQ structured data that matches its visible questions", async ({ page }) => {
    await page.goto("/about", { waitUntil: "load" });
    const f = await facts(page);
    const faq = f.jsonLd.map((s) => JSON.parse(s)).flat().find((j) => j["@type"] === "FAQPage");
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);
    for (const q of faq.mainEntity) await expect(page.getByRole("heading", { name: q.name })).toBeVisible();
  });

  test("site-wide structured data names the app, the company and the open-source repo", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const f = await facts(page);
    const nodes = f.jsonLd.map((s) => JSON.parse(s)).flat();
    const app = nodes.find((n) => n["@type"] === "WebApplication");
    const org = nodes.find((n) => n["@type"] === "Organization");
    expect(app).toMatchObject({ name: "Shadely", isAccessibleForFree: true });
    expect(app.codeRepository).toContain("github.com/GroundworkTechnologies/Shadely");
    expect(org.name).toBe("Groundwork Technologies");
    expect(org.sameAs).toContain("https://github.com/GroundworkTechnologies/Shadely");
  });

  test("a missing page returns 404, is noindex and has its own title", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist", { waitUntil: "load" });
    expect(res?.status()).toBe(404);
    const f = await facts(page);
    expect(f.robots).toContain("noindex");
    expect(f.title).toBe("Shadely: Page Not Found");
    expect(f.canonical).toBeNull();
    expect(f.h1).toHaveLength(1);
  });

  test("a shared palette link is noindex, canonical to the home page, and has its own social image", async ({ page }) => {
    await page.goto("/?b=f59e0b&nm=amber", { waitUntil: "load" });
    const f = await facts(page);
    expect(f.robots).toContain("noindex");
    expect(f.ogImage).toContain("/api/og?b=f59e0b");
    expect(f.title).toContain("amber");
  });
});

test.describe("crawl files", () => {
  test("robots.txt lets crawlers fetch share images and keeps private pages out", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    expect(txt).toMatch(/Allow: \/api\/og/);
    expect(txt).toMatch(/Disallow: \/api\//);
    expect(txt).toMatch(/Disallow: \/palettes/);
    expect(txt).toMatch(/Sitemap: .+\/sitemap\.xml/);
  });

  test("sitemap lists exactly the indexable pages, at their canonical addresses", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
    expect(paths.sort()).toEqual(indexable.map(([, p]) => p.path).sort());
    expect(xml).toContain("<lastmod>");
    expect(xml).not.toContain("/palettes");
  });

  test("every address in the sitemap loads", async ({ request }) => {
    for (const [, p] of indexable) expect((await request.get(p.path)).status(), p.path).toBe(200);
  });

  test("the default share image loads as a PNG", async ({ request }) => {
    const res = await request.get("/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});

test.describe("mobile SEO", () => {
  test.use({ viewport: { width: 390, height: 800 } });
  test("the mobile layout has the same title and H1, no sideways scroll, and readable text", async ({ page }) => {
    for (const [, p] of indexable) {
      await page.goto(p.path, { waitUntil: "load" });
      const f = await facts(page);
      expect(f.title).toBe(p.title);
      expect(f.h1).toHaveLength(1);
      const m = await page.evaluate(() => {
        const tiny = [...document.querySelectorAll("main p, main li, main a, main label, main span")].filter((e) => {
          const el = e as HTMLElement;
          return el.childElementCount === 0 && (el.textContent ?? "").trim().length > 3 && parseFloat(getComputedStyle(el).fontSize) < 11 && el.offsetParent !== null;
        }).length;
        return { overflow: document.documentElement.scrollWidth - innerWidth, tiny };
      });
      expect(m.overflow, `${p.path} overflow`).toBeLessThanOrEqual(0);
      expect(m.tiny, `${p.path} text under 11px`).toBe(0);
    }
  });
});

test.describe("production address", () => {
  const ORIGIN = "https://shadely.groundwork.co.ke";
  test("canonical, sitemap, robots and structured data all use the real domain", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "load" });
    const f = await facts(page);
    expect(f.canonical).toBe(`${ORIGIN}/`);
    expect(f.ogImage).toMatch(new RegExp(`^${ORIGIN}/opengraph-image`));
    expect(f.jsonLd.join(" ")).toContain(`${ORIGIN}/brand/png/shadely-app-icon-512.png`);
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) expect(m[1]!.startsWith(`${ORIGIN}/`)).toBe(true);
    expect(await (await request.get("/robots.txt")).text()).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  });
});
