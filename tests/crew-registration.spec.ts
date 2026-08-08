import { test, expect } from "@playwright/test";
import path from "path";

const TEST_EMAIL_BASE = `crew-${Date.now()}`;

test("3T's (Hip-Hop Crew) registration completes end to end", async ({
  page,
}) => {
  await page.goto("/register/hip-hop-dance");

  await page.getByLabel("Crew Name").fill("Playwright Test Crew");
  // Category defaults to "College Crew"
  await page.getByLabel("College / University Name").fill("Test University");
  await page.getByLabel("City").fill("Hyderabad");
  await page.getByLabel("State").fill("Telangana");

  await page.getByRole("button", { name: "Continue" }).click();

  // Crew requires MIN_MEMBERS = 8. Fill leader (member 1, already open),
  // then add and fill 7 more using "Same as Crew Leader" for institution
  // to keep this test manageable.
  await fillMember(page, 0, "Crew Leader", TEST_EMAIL_BASE, true, false);

  for (let i = 1; i < 5; i++) {
    await page.getByRole("button", { name: "+ Add Member" }).click();
    await fillMember(page, i, `Member ${i + 1}`, TEST_EMAIL_BASE, false, true);
  }

  await expect(page.getByText("5 / 25 members")).toBeVisible();

  await page.getByLabel("Performance Duration").fill("5 minutes");
  await page.getByLabel("No").check(); // props used = No

  await page.getByLabel(/We agree to abide by the rules/i).check();
  await page.getByLabel(/All information provided is accurate/i).check();

  await page.getByRole("button", { name: "Continue to Payment" }).click();

  await expect(page.getByText("₹3115")).toBeVisible();

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
  await expect(page.getByText("5 members")).toBeVisible();
  await expect(page.getByText(/coupon/i)).toBeVisible();
});

async function fillMember(
  page: import("@playwright/test").Page,
  index: number,
  name: string,
  emailBase: string,
  isLeader: boolean,
  useSameAsLeader: boolean
) {
  // Expand the member card if it's not the currently-open one already
  await page.getByText(index === 0 ? "Crew details" : `Member ${index + 1}`, {
    exact: false,
  }).first();

  // Select the member card by its container class + position, not by
  // filtering on visible text (which was unreliable - matched an
  // unpredictable nested div rather than the actual card boundary).
  const card = page
    .locator('div.rounded-xl.border.border-white\\/10.bg-bg-surface.overflow-hidden')
    .nth(index);

  await card.getByLabel("Name").fill(name);
  await card.getByLabel("Phone").fill(`98765432${String(index).padStart(2, "0")}`);
  await card.getByLabel("Email").fill(`${emailBase}-${index}@playwright-test.com`);
  await card.getByLabel("Age").fill("20");

  if (useSameAsLeader) {
    await card.getByLabel(/Same as Crew Leader/i).check();
  } else {
    await card.getByLabel("Institution").fill("N/A");
  }

  await card.locator('input[type="file"]').setInputFiles(
    path.join(__dirname, "fixtures", "test-id.jpg")
  );
}
