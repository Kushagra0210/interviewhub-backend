const { test, expect } = require("@playwright/test");
test("real Ollama interview produces a persisted report through the browser", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByLabel("Your name").fill("Live Practice");
  await page.getByLabel("Email address").fill(`live-${Date.now()}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("live-test-password-only");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Live." }),
  ).toBeVisible();
  await page.goto("/interviews/new");
  await page.getByLabel("Target role").selectOption("Backend Engineer");
  await page.getByLabel("Topics").fill("hash tables");
  await page.getByLabel("Number of questions").selectOption("1");
  await page.getByRole("button", { name: "Enter your interview" }).click();
  await page
    .getByRole("button", { name: "Start interview", exact: true })
    .click();
  await expect(page.getByLabel("Your answer")).toBeVisible({ timeout: 180000 });
  await page
    .getByLabel("Your answer")
    .fill(
      "A hash table maps keys to buckets using a hash function. Collisions can be handled with chaining and comparing the original keys. With a suitable hash function and controlled load factor, lookup is expected O(1), while worst-case collisions can cause O(n) behavior. Resizing limits load; test duplicate keys, empty inputs and collisions.",
    );
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(
    page.getByRole("heading", { name: "A clearer picture of your practice." }),
  ).toBeVisible({ timeout: 180000 });
  await page.reload();
  await expect(
    page.getByText("SESSION COMPLETE", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: ".local/screenshots/real-report.png",
    fullPage: true,
  });
});
