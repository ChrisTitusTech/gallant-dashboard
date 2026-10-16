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
    await expect(
      page.getByRole("heading", { name: "Your year at a glance" }),
    ).toBeVisible();
    await page.getByLabel("Calendar metric").selectOption("strain");
    const calendarDay = page
      .getByRole("button", { name: /^\d{4}-\d{2}-\d{2}: Strain/ })
      .and(page.locator(":enabled"));
    await calendarDay.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "30 days", exact: true }).click();
    for (const [tab, heading] of [
      ["Sleep", "Sleep stages"],
      ["Recovery", "HRV and your baseline"],
    ]) {
      if (label === "mobile")
        await page.getByRole("button", { name: "Open navigation" }).click();
      await page.getByRole("button", { name: tab, exact: true }).click();
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
      assert.equal(
        await page.evaluate(
          () =>
            globalThis.document.documentElement.scrollWidth <=
            globalThis.innerWidth,
        ),
        true,
      );
      await page.screenshot({
        path: `/tmp/gallant-live-${tab.toLowerCase()}-${label}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
    assert.deepEqual(errors, []);
    console.log(
      `Production ${label}: sign-in link, charts, ranges, details, yearly calendar, sleep/recovery analytics, layout, and JavaScript passed.`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
