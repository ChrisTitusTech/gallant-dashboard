import { test, expect } from "@playwright/test";
import { sample } from "../web/demo";

test("landing page identifies demo data and provides WHOOP sign-in", async ({
  page,
}, info) => {
  await page.route("**/api/me", (route) =>
    route.fulfill({ status: 401, json: { error: "Sign in" } }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your history. More perspective." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Connect with WHOOP" }),
  ).toHaveAttribute("href", "/auth/whoop");
  await expect(page.getByText("Illustrative sample")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/landing-${info.project.name}.png`,
    fullPage: true,
  });
});
test("demo charts support range changes, details, long history, and keyboard dialogs", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Your effort. Your rhythm." }),
  ).toBeVisible();
  await expect(
    page.getByText("All values are illustrative.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "7 days", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await page
    .getByRole("button", { name: /^View \d/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "1 year", exact: true }).click();
  await expect(
    page.getByText("Weekly averages", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(30);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Page 2 of", { exact: false })).toBeVisible();
  await page.getByLabel("Start date").fill("2019-01-01");
  await expect(
    page.getByText("Monthly averages", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(30);
  await page.getByRole("button", { name: "30 days", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/dashboard-${info.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("private account settings require a preview before publishing", async ({
  page,
}, info) => {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  await page.route("**/api/me", (route) =>
    route.fulfill({
      json: { name: "Test Member", connected: true, shareUrl: null },
    }),
  );
  await page.route("**/api/me/dashboard?*", (route) =>
    route.fulfill({ json: sample(start, end) }),
  );
  await page.route("**/api/me/sync", (route) =>
    route.fulfill({ json: { connected: true, lastSync: null, jobs: [] } }),
  );
  let published = false;
  await page.route("**/api/me/sharing", (route) => {
    published = true;
    return route.fulfill({
      json: { shareUrl: "http://localhost:5173/share/example-public-link" },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview public sharing", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "Public dashboard preview" }),
  ).toBeVisible();
  expect(published).toBe(false);
  await page.screenshot({
    path: `test-results/sharing-${info.project.name}.png`,
  });
  await page
    .getByRole("button", {
      name: "Enable full-dashboard sharing",
      exact: false,
    })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Your public link is ready.",
  );
  expect(published).toBe(true);
});
test("public dashboard has no exports or account mutations", async ({
  page,
}) => {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  await page.route("**/api/shared/*", (route) =>
    route.fulfill({ json: sample(start, end) }),
  );
  await page.goto("/share/example");
  await expect(
    page.getByText("This dashboard was shared by", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Share", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Export CSV" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Account & sharing" }),
  ).toHaveCount(0);
});
