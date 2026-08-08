import { test, expect } from "@playwright/test";
import path from "path";

const TEST_EMAIL = `dance-solo-${Date.now()}@playwright-test.com`;

test("Aangikam (Classical Dance) solo registration completes end to end", async ({
  page,
}) => {
  await page.goto("/register/classical-dance");

  await page.getByLabel("City").fill("Hyderabad");
  await page.getByLabel("State").fill("Telangana");
  await page.getByLabel("Email").fill(TEST_EMAIL);

  await page.getByLabel(/Junior/i).check();
  // Performance type defaults to Solo; leave as-is.

  await page.getByRole("button", { name: "Continue" }).click();

  // Participant details step
  await page.getByLabel("Name").fill("Playwright Test Dancer");
  await page.getByLabel("Institution").fill("N/A");

  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, "fixtures", "test-id.jpg")
  );

  await page.getByRole("button", { name: "Continue to Payment" }).click();

  await expect(page.getByText("Total Amount")).toBeVisible();

  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, "fixtures", "test-payment.jpg")
  );

  await page.getByRole("button", { name: "Submit Registration" }).click();

  await expect(page.getByText("You're registered!")).toBeVisible({
    timeout: 15000,
  });
});
