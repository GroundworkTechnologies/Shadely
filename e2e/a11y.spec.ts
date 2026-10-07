import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/palettes", "/tailwind-colors", "/about", "/privacy"];

async function scan(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target.join(" ")}`);
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe, ${scheme} mode`, () => {
    // Reduced motion removes color transitions, so axe never samples a half-faded color.
    test.use({ reducedMotion: "reduce" });
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((m) => localStorage.setItem("shadely-theme", m), scheme);
    });

    for (const route of ROUTES) {
      test(`${route} has no WCAG A/AA violations`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        expect(await scan(page)).toEqual([]);
      });
    }

    test("the options and both dialogs have no violations", async ({ page }) => {
      await page.goto("/?b=3b82f6&hm=triadic&ct=w~600~4.5,900~100~4.5");
      await page.waitForLoadState("networkidle");
      await page.getByText("Options").first().click();
      expect(await scan(page), "options").toEqual([]);
      await page.getByRole("button", { name: "Contrast", exact: true }).click();
      await expect(page.getByText("Pairing matrix")).toBeVisible();
      expect(await scan(page), "contrast dialog").toEqual([]);
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Export", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Export code" })).toBeVisible();
      expect(await scan(page), "export dialog").toEqual([]);
    });

    test("every preview page has no WCAG A/AA violations", async ({ page }) => {
      await page.goto("/?b=505cc6");
      const tabs = page.getByRole("tablist", { name: "Preview pages" }).getByRole("tab");
      for (let i = 0; i < (await tabs.count()); i++) {
        await tabs.nth(i).click();
        const label = await tabs.nth(i).innerText();
        expect(await scan(page), label).toEqual([]);
      }
    });
  });
}
