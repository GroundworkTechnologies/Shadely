import { expect, test } from "@playwright/test";

const search = (url: string) => new URL(url).search;
/** Open a page and wait until it has hydrated, so typing is not lost to a late React mount. */
const open = async (page: import("@playwright/test").Page, url = "/") => {
  await page.goto(url, { waitUntil: "networkidle" });
};

test.describe("generator", () => {
  test("loads with a default palette and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await open(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tailwind color palette generator");
    await expect(page.getByRole("tablist", { name: "Scale" }).getByRole("tab")).toHaveCount(6);
    expect(errors).toEqual([]);
  });

  test("typing a color updates the scale name and the URL", async ({ page }) => {
    await open(page);
    await page.getByRole("textbox", { name: "Base color", exact: true }).fill("#505cc6");
    await expect(page.locator("section[aria-label='Color scales'] h2")).toHaveText("Indigo");
    await expect.poll(() => search(page.url())).toContain("b=505cc6");
  });

  test("invalid input shows a message and keeps the last good color", async ({ page }) => {
    await open(page, "/?b=505cc6");
    await page.getByRole("textbox", { name: "Base color", exact: true }).fill("banana");
    await expect(page.getByText("Not a valid color")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox", { name: "Base color", exact: true })).toHaveValue("#505cc6");
  });

  test("space shuffles, undo and redo restore", async ({ page }) => {
    await open(page, "/?b=505cc6");
    await page.mouse.click(700, 60);
    await page.keyboard.press("Space");
    await expect.poll(() => search(page.url())).not.toContain("b=505cc6");
    const shuffled = search(page.url());
    await page.keyboard.press("Control+z");
    await expect.poll(() => search(page.url())).toContain("b=505cc6");
    await page.keyboard.press("Control+Shift+z");
    await expect.poll(() => search(page.url())).toBe(shuffled);
  });

  test("ZIP bundle downloads", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: "Export", exact: true }).click();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /all formats \(ZIP\)/i }).click()]);
    expect(download.suggestedFilename()).toMatch(/^shadely-.*\.zip$/);
  });

  test("every preview page renders", async ({ page }) => {
    await open(page);
    const tabs = page.getByRole("tablist", { name: "Preview pages" }).getByRole("tab");
    const n = await tabs.count();
    expect(n).toBe(11);
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click();
      await expect(page.locator("#preview-panel")).not.toBeEmpty();
    }
  });
});

test.describe("responsive", () => {
  for (const width of [360, 390, 768, 1100, 1500]) {
    test(`no horizontal scroll at ${width}px on every preview page`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      const tabs = page.getByRole("tablist", { name: "Preview pages" }).getByRole("tab");
      for (let i = 0; i < (await tabs.count()); i++) {
        await tabs.nth(i).click();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `tab ${i}`).toBeLessThanOrEqual(0);
      }
    });
  }
  test("header, content and footer share one left edge", async ({ page }) => {
    for (const width of [390, 1500]) {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      const edges = await page.evaluate(() => [document.querySelector("header a"), document.querySelector("h1"), document.querySelector("footer p")].map((e) => Math.round(e!.getBoundingClientRect().left)));
      expect(new Set(edges).size, `${width}: ${edges}`).toBe(1);
    }
  });
});

test.describe("performance budget", () => {
  test("first-load JavaScript for / stays under budget (gzip)", async ({ page }) => {
    const { gzipSync } = await import("node:zlib");
    const pending: Promise<number>[] = [];
    page.on("response", (r) => {
      if ((r.headers()["content-type"] ?? "").includes("javascript")) pending.push(r.body().then((b) => gzipSync(b).length).catch(() => 0));
    });
    await page.goto("/", { waitUntil: "networkidle" });
    const kb = (await Promise.all(pending)).reduce((a, b) => a + b, 0) / 1024;
    console.log(`first-load JS (gzip): ${kb.toFixed(1)} KB across ${pending.length} files`);
    expect(kb).toBeLessThan(Number(process.env.JS_BUDGET_KB ?? 190));
  });
});

test.describe("options and export", () => {
  test("the AA toggle adjusts shades and is shareable", async ({ page }) => {
    await open(page, "/?b=facc15");
    await page.getByText("Options").click();
    await page.getByLabel("Make shades pass AA contrast").check();
    await expect.poll(() => decodeURIComponent(search(page.url()))).toContain("ct=w~600~4.5");
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("Options").click();
    await expect(page.getByLabel("Make shades pass AA contrast")).toBeChecked();
  });

  test("neutral and extra-scale options change the scales", async ({ page }) => {
    await open(page, "/?b=505cc6");
    await page.getByText("Options").click();
    await page.getByLabel("Extra scales from the brand hue").selectOption("triadic");
    await expect(page.getByRole("tablist", { name: "Scale" }).getByRole("tab")).toHaveCount(8);
    await page.getByLabel("Status scales (success, warning, danger, info)").uncheck();
    await expect(page.getByRole("tablist", { name: "Scale" }).getByRole("tab")).toHaveCount(4);
  });

  test("the export format picker switches the code", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: "Export", exact: true }).click();
    await page.getByLabel("Format").selectOption("flutter");
    await expect(page.locator("pre code")).toContainText("MaterialColor");
    await expect.poll(() => search(page.url())).toContain("f=fl");
  });
});

test.describe("theme", () => {
  test("is light by default, even when the system prefers dark, and toggles between light and dark only", async ({ browser }) => {
    const page = await (await browser.newContext({ colorScheme: "dark" })).newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    const toggle = page.getByRole("button", { name: /^Theme:/ });
    await toggle.click();
    await expect(html).toHaveClass(/dark/);
    await page.reload({ waitUntil: "networkidle" });
    await expect(html).toHaveClass(/dark/);
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });
});

test.describe("rename migration", () => {
  test("saved palettes and the theme saved as Tintwork carry over to Shadely", async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("tintwork:palettes:v1", JSON.stringify([{ id: "legacy-1", name: "Old indigo #505cc6", query: "v=1&b=505cc6", base: "#505cc6", createdAt: 1 }]));
      localStorage.setItem("tintwork-theme", "dark");
    });
    await page.goto("/palettes", { waitUntil: "networkidle" });
    await expect(page.getByLabel("Palette name")).toHaveValue("Old indigo #505cc6");
    await expect(page.locator("html")).toHaveClass(/dark/);
    const keys = await page.evaluate(() => ({ old: localStorage.getItem("tintwork:palettes:v1"), now: localStorage.getItem("shadely:palettes:v1"), theme: localStorage.getItem("shadely-theme") }));
    expect(keys.old).toBeNull();
    expect(keys.now).toContain("legacy-1");
    expect(keys.theme).toBe("dark");
  });
});

test.describe("hidden panels and no page scroll", () => {
  test("contrast and export are hidden until asked for", async ({ page }) => {
    await open(page);
    await expect(page.getByRole("heading", { name: /^Contrast/ })).toBeHidden();
    await expect(page.getByRole("heading", { name: "Export code" })).toBeHidden();
    await page.getByRole("button", { name: "Contrast", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Contrast" })).toBeVisible();
    await expect(page.getByText("Pairing matrix")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.getByRole("button", { name: "Export", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Export" })).toBeVisible();
    await page.getByRole("button", { name: "Close Export" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  for (const [width, height] of [[1280, 720], [1440, 900], [1920, 1080]] as const) {
    test(`the page does not scroll at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await open(page, "/?b=505cc6&hm=triadic");
      const tabs = page.getByRole("tablist", { name: "Preview pages" }).getByRole("tab");
      for (let i = 0; i < (await tabs.count()); i++) {
        await tabs.nth(i).click();
        const m = await page.evaluate(() => {
          const main = document.querySelector("main")!;
          return { doc: document.documentElement.scrollHeight - innerHeight, main: main.scrollHeight - main.clientHeight, footerBottom: document.querySelector("body > footer")!.getBoundingClientRect().bottom - innerHeight };
        });
        expect(m.doc, `tab ${i} document`).toBeLessThanOrEqual(0);
        expect(m.main, `tab ${i} main`).toBeLessThanOrEqual(1);
        expect(m.footerBottom, `tab ${i} footer on screen`).toBeLessThanOrEqual(1);
      }
    });
  }

  test("the preview scrolls inside its own frame", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await open(page);
    const frame = await page.locator("#preview-panel").evaluate((e) => ({ scrolls: e.scrollHeight > e.clientHeight, overflowY: getComputedStyle(e).overflowY }));
    expect(frame.overflowY).toBe("auto");
    expect(frame.scrolls).toBe(true);
  });
});

test.describe("open source link", () => {
  test("links to the GitHub repo from the header and the footer", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    const repo = "https://github.com/GroundworkTechnologies/Shadely";
    const header = page.locator("header").getByRole("link", { name: /Shadely on GitHub/ });
    const footer = page.locator("body > footer").getByRole("link", { name: /Open source on GitHub/ });
    for (const link of [header, footer]) {
      await expect(link).toHaveAttribute("href", repo);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("on a phone the footer link is there and the header stays uncrowded", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await open(page);
    await expect(page.locator("header").getByRole("link", { name: /Shadely on GitHub/ })).toBeHidden();
    await expect(page.locator("body > footer").getByRole("link", { name: /Open source on GitHub/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});
