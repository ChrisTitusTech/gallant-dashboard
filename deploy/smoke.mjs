import process from "node:process";
import console from "node:console";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env.SMOKE_URL ?? "https://whoop.3spinningplates.com";
const browser = await chromium.launch();
try {
  for (const [label, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "Your history. More perspective." })
      .waitFor();
    assert.equal(
      await page
        .getByRole("link", { name: "Connect with WHOOP" })
        .getAttribute("href"),
      "/auth/whoop",
    );
    await page.goto(base + "/demo", { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "Your effort. Your rhythm." })
      .waitFor();
    await page.getByRole("button", { name: "7 days", exact: true }).click();
    await expect(page.locator("tbody tr")).toHaveCount(7);
    await page
      .getByRole("button", { name: /^View \d/ })
      .first()
      .click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "30 days", exact: true }).click();
    assert.equal(
      await page.evaluate(
        () =>
          globalThis.document.documentElement.scrollWidth <=
          globalThis.innerWidth,
      ),
      true,
    );
    await page.screenshot({
      path: `/tmp/gallant-live-${label}.png`,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      `Production ${label}: sign-in link, charts, ranges, details, layout, and JavaScript passed.`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
