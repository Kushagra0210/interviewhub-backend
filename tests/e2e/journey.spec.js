const { test, expect } = require("@playwright/test");
test("register, search, interview, report and persistence after reload", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByLabel("Your name").fill("Practice User");
  await page
    .getByLabel("Email address")
    .fill(`practice-${Date.now()}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("a-strong-test-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Practice." }),
  ).toBeVisible();
  await page.screenshot({
    path: ".local/screenshots/dashboard.png",
    fullPage: true,
  });
  await page.goto("/questions");
  await page
    .getByRole("textbox", { name: "Search questions" })
    .fill("sliding window");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Explain: sliding window for longest unique substring",
    }),
  ).toBeVisible();
  await page.goto("/interviews/new");
  await page.getByLabel("Number of questions").selectOption("1");
  await page.getByRole("button", { name: "Enter your interview" }).click();
  await page
    .getByRole("button", { name: "Start interview", exact: true })
    .click();
  await expect(
    page.getByText("How would you find a pair of numbers with a target sum?"),
  ).toBeVisible();
  await page
    .getByLabel("Your answer")
    .fill(
      "Track each previous number in a hash set. For each new number, check target minus the number. This takes expected O(n) time and O(n) space.",
    );
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(
    page.getByRole("heading", { name: "A clearer picture of your practice." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Practice boundary cases")).toBeVisible();
  await page.goto("/history");
  await expect(page.getByText("completed", { exact: true })).toBeVisible();
});
test("protected pages redirect and invalid auth has an accessible error", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
  await page.getByLabel("Email address").fill("missing@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Invalid credentials" }),
  ).toBeVisible();
});
