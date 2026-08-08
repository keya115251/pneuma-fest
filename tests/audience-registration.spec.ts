import { test, expect } from "@playwright/test";
import path from "path";

const TEST_EMAIL = `audience-${Date.now()}@playwright-test.com`;

test("Audience registration completes end to end", async ({ page }) => {
  await page.goto("/register/audience");

  await page.getByLabel("Name").fill("Playwright Test Audience");
  await page.getByLabel("Age").fill("21");
  await page.getByLabel("Institution").fill("Test University");
  await page.getByLabel(/Phone/i).fill("9876543210");
  await page.getByLabel("Email").fill(TEST_EMAIL);

  await page.getByRole("button", { name: "Continue to Payment" }).click();

  await expect(page.getByText("Total Amount")).toBeVisible();
  await expect(page.getByText("₹100")).toBeVisible();

  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, "fixtures", "test-payment.jpg")
  );

  await page.getByRole("button", { name: "Submit Registration" }).click();

  // Give it more time and check for a possible inline error message too,
  // so if this fails again the output tells us WHY instead of just timing
  // out with no information.
  await expect(
    page.getByText("You're registered!").or(page.getByText(/something went wrong/i))
  ).toBeVisible({ timeout: 25000 });

  await expect(page.getByText("You're registered!")).toBeVisible();
});
