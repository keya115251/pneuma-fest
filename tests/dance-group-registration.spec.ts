import { test, expect } from "@playwright/test";
import path from "path";

const TEST_EMAIL = `dance-group-${Date.now()}@playwright-test.com`;

test("Aangikam group registration completes end to end", async ({ page }) => {
  await page.goto("/register/classical-dance");

  await page.getByLabel("City").fill("Hyderabad");
  await page.getByLabel("State").fill("Telangana");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel(/Junior/i).check();
  await page.getByLabel("Group").check();

  await page.getByRole("button", { name: "Continue" }).click();

  // Group Head (member 1) - already open by default
  await page.getByLabel("Name").fill("Group Leader");
  await page.getByLabel("Contact").fill("9876543210");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Age").fill("20");
  await page.getByLabel("Institution").fill("N/A");
  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, "fixtures", "test-id.jpg")
  );

  // Add a second member
  await page.getByRole("button", { name: "+ Add Member" }).click();
  // Member 2's card auto-opens after being added (component sets
  // openIndex to the new participant automatically).

  // Select the participant card by its actual container class + position
  // (index 1 = second card) instead of text-filtering, which was matching
  // an unpredictable nested div and only partially working.
  const member2 = page.locator(
    'div.rounded-xl.border.border-white\\/10.bg-bg-surface.overflow-hidden'
  ).nth(1);

  await member2.getByLabel("Name").fill("Second Member");
  await member2.getByLabel("Contact").fill("9876543211");
  await member2.getByLabel("Email").fill(`member2-${Date.now()}@playwright-test.com`);
  await member2.getByLabel("Age").fill("21");

  // Use "Same as Group Leader" instead of retyping institution
  await member2.getByLabel(/Same as Group Leader/i).check();

  await member2.locator('input[type="file"]').setInputFiles(
    path.join(__dirname, "fixtures", "test-id.jpg")
  );

  await page.getByRole("button", { name: "Continue to Payment" }).click();

  await expect(page.getByText("Total Amount")).toBeVisible();
  await expect(page.getByText("₹1000")).toBeVisible(); // 2 x 500

  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, "fixtures", "test-payment.jpg")
  );

  await page.getByRole("button", { name: "Submit Registration" }).click();

  await expect(page.getByText("You're registered!")).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Group of 2")).toBeVisible();
});
