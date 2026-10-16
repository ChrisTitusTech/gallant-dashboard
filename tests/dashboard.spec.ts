import { test, expect } from "@playwright/test";
import { sample } from "../web/demo";
import { analyticsPayload, lifetimeStats } from "../server/analytics";

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

test("analytics views and calendar support navigation without mobile overflow", async ({
  page,
}, info) => {
  await page.clock.setFixedTime(new Date("2026-10-15T12:00:00Z"));
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Your year at a glance" }),
  ).toBeVisible();
  await page.getByLabel("Calendar year").selectOption("2025");
  await page.getByLabel("Calendar metric").selectOption("strain");
  await expect(
    page.getByRole("button", { name: /^2025-12-15: Strain/ }),
  ).toBeEnabled();
  await page.getByRole("button", { name: /^2025-12-15: Strain/ }).click();
  await expect(page.getByRole("dialog")).toContainText("CYCLE");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "30 days", exact: true }).click();
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sleep", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sleep stages" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sleep timing" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/sleep-analytics-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Recovery", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "HRV and your baseline" }),
  ).toBeVisible();
  await expect(page.getByText(/preceding 28 calendar days/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/recovery-analytics-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
});

test("empty histories keep gaps distinct and calendar days work with a keyboard", async ({
  page,
}, info) => {
  await page.clock.setFixedTime(new Date("2026-10-15T12:00:00Z"));
  const empty = {
    ...sample("2026-09-16", "2026-10-15"),
    lifetime: lifetimeStats([]),
    exploration: [],
    earliest: null,
    latest: null,
    details: [],
    analytics: analyticsPayload([], "2026-09-16", "2026-10-15"),
  };
  await page.route("**/api/shared/*", (route) =>
    route.fulfill({ json: empty }),
  );
  await page.goto("/share/test-empty");
  await expect(
    page.getByText("0 scored days in 2026.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "2026-12-01: Recovery future date",
      exact: true,
    }),
  ).toBeDisabled();
  const day = page.getByRole("button", {
    name: "2026-10-01: Recovery no data",
    exact: true,
  });
  await day.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toContainText(
    "No records for this day.",
  );
  await page.keyboard.press("Escape");
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sleep", exact: true }).click();
  await expect(page.getByText("No scored data for this period.")).toHaveCount(
    4,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("lifetime statistics stay constant across chart ranges", async ({
  page,
}, info) => {
  await page.clock.setFixedTime(new Date("2026-10-15T12:00:00Z"));
  await page.goto("/demo");
  const lifetime = page.getByRole("region", { name: "Lifetime statistics" });
  await expect(lifetime).toContainText("2023-01-01");
  await expect(lifetime).toContainText("Average strain");
  const original = await lifetime.innerText();
  for (const range of ["7 days", "1 year"]) {
    await page.getByRole("button", { name: range, exact: true }).click();
    await expect(lifetime).toHaveText(original, { useInnerText: true });
  }
  await lifetime.scrollIntoViewIfNeeded();
  await lifetime.screenshot({
    path: `test-results/lifetime-${info.project.name}.png`,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("exploration views filter workouts, align correlations, and compare years", async ({
  page,
}, info) => {
  await page.clock.setFixedTime(new Date("2026-10-15T12:00:00Z"));
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/demo");
  const navigate = async (name: string) => {
    if (info.project.name === "mobile")
      await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("button", { name, exact: true }).click();
  };
  await navigate("Workouts");
  const workouts = page.getByRole("region", { name: "Workout explorer" });
  await expect(workouts.getByRole("status")).toContainText("matching workouts");
  await workouts.getByLabel("Sport", { exact: true }).selectOption("Running");
  const count = await workouts.locator("tbody tr").count();
  expect(count).toBeGreaterThan(0);
  await expect(workouts.locator("tbody")).not.toContainText("Cycling");
  await workouts.getByLabel("Min duration (min)").fill("10000");
  await expect(workouts).toContainText("No workouts match");
  await workouts.getByRole("button", { name: "Reset filters" }).click();
  await workouts.getByLabel("Heart-rate zone").selectOption("zone_two_milli");
  await workouts.getByLabel("Min zone time (min)").fill("100");
  await expect(workouts).toContainText("No workouts match");
  await workouts.getByRole("button", { name: "Reset filters" }).click();
  await workouts
    .getByRole("button", { name: /^View / })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("WORKOUT");
  await page.keyboard.press("Escape");
  await workouts.screenshot({
    path: `test-results/workouts-${info.project.name}.png`,
  });
  await navigate("Correlations");
  const correlations = page.getByRole("region", {
    name: "Personal correlations",
  });
  await expect(correlations).toContainText("(30 paired days)");
  await correlations.getByLabel("Input metric").selectOption("strain");
  await correlations.getByLabel("Outcome timing").selectOption("1");
  await expect(correlations).toContainText("(29 paired days)");
  await page.getByRole("button", { name: "7 days", exact: true }).click();
  await expect(correlations).toContainText("At least 10 paired days");
  await page.getByRole("button", { name: "30 days", exact: true }).click();
  await correlations.locator(".recharts-scatter-symbol").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await correlations.screenshot({
    path: `test-results/correlations-${info.project.name}.png`,
  });
  await navigate("Year comparisons");
  const years = page.getByRole("region", {
    name: "Year-over-year comparisons",
  });
  await years.getByLabel("First year").selectOption("2024");
  await years.getByLabel("Second year").selectOption("2023");
  await expect(years).toContainText("365 matched calendar days");
  await years.getByLabel("Comparison metric").selectOption("recovery");
  await expect(years.locator("tbody tr")).toHaveCount(12);
  await page.getByRole("button", { name: "7 days", exact: true }).click();
  await expect(years).toContainText("365 matched calendar days");
  await years.screenshot({
    path: `test-results/years-${info.project.name}.png`,
  });
  await years.getByLabel("Second year").selectOption("2024");
  await expect(years).toContainText("Choose two different years");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("exploration views explain empty histories", async ({ page }, info) => {
  const empty = {
    ...sample("2026-10-01", "2026-10-15"),
    details: [],
    exploration: [],
  };
  await page.route("**/api/shared/*", (route) =>
    route.fulfill({ json: empty }),
  );
  await page.goto("/share/empty");
  for (const [name, message] of [
    ["Workouts", "No workouts match"],
    ["Correlations", "No paired observations"],
    ["Year comparisons", "Import at least two years"],
  ]) {
    if (info.project.name === "mobile")
      await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.getByText(message, { exact: false })).toBeVisible();
  }
});
