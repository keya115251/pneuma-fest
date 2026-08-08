import { test, expect } from "@playwright/test";
import path from "path";

const TEST_EMAIL = `band-round1-${Date.now()}@playwright-test.com`;

test("Battle of the Bands Round 1 registration completes end to end", async ({
  page,
}) => {
  await page.goto("/register/battle-of-the-bands");

  await page.getByLabel("Band Name").fill("Playwright Test Band");
  await page.getByLabel("Number of Members").fill("5");
  await page.getByLabel("City").fill("Hyderabad");
  await page.getByLabel("State").fill("Telangana");
  await page
    .getByLabel(/Performance \/ Practice Video/i)
    .fill("https://drive.google.com/test-link");

  await page.getByLabel("Name", { exact: true }).fill("Playwright Test POC");
  await page.getByLabel("Phone").fill("9876543210");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Institution").fill("N/A");

  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, "fixtures", "test-id.jpg")
  );

  await page.getByRole("button", { name: "Continue to Payment" }).click();

  await expect(page.getByText("Round 1 Entry Fee")).toBeVisible();
  await expect(page.getByText("₹100")).toBeVisible();

  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, "fixtures", "test-payment.jpg")
  );

  await page.getByLabel("Payee Name").fill("Playwright Payer");
  await page.getByLabel("Payee Mobile Number").fill("9999999999");
  await page.getByLabel(/UTR/i).fill("UTR123456789TEST");

  await page.getByRole("button", { name: "Submit Registration" }).click();

  await expect(page.getByText("You're registered!")).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Playwright Test Band")).toBeVisible();

  // Round 1 should NOT generate or show a workshop coupon code - that
  // only happens at Round 2. Guard against a regression where coupon
  // logic accidentally ends up back on Round 1.
  await expect(page.getByText(/coupon/i)).not.toBeVisible();
});
