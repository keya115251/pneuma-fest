import { test, expect } from "@playwright/test";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Round 2 requires an existing Round 1 registration with status='selected'.
// This test seeds one directly via the service role key before running
// the actual UI flow, then the cleanup script removes it afterward
// (band_registrations rows created this way also match the
// @playwright-test.com filter used in cleanup-test-data.sql).

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BAND_NAME = `Playwright Round2 Band ${Date.now()}`;
const POC_PHONE = "9998887770";
const POC_EMAIL = `round2-poc-${Date.now()}@playwright-test.com`;

// Round 2 is intentionally gated behind a round2Open flag (see FestEvent
// type) until Round 1 closes and bands are selected - the form doesn't
// render at all until then, regardless of registration status. Skip this
// test until that flag is flipped on; re-enable by changing .skip to
// nothing once Round 2 is actually open.
test.skip("Battle of the Bands Round 2 registration completes end to end", async ({
  page,
}) => {
  // --- Setup: seed a "selected" Round 1 registration ---
  const { data: seeded, error: seedError } = await supabaseAdmin
    .from("band_registrations")
    .insert({
      band_name: BAND_NAME,
      participant_count: 4,
      city: "Hyderabad",
      state: "Telangana",
      video_link: "https://drive.google.com/test",
      poc_name: "Playwright POC",
      poc_phone: POC_PHONE,
      poc_email: POC_EMAIL,
      poc_institution: "N/A",
      amount_paid: 100,
      status: "selected",
    })
    .select()
    .single();

  expect(seedError).toBeNull();
  expect(seeded).toBeTruthy();

  // --- Actual UI flow ---
  await page.goto("/register/battle-of-the-bands/round-2");

  await page.getByLabel("Band Name").fill(BAND_NAME);
  await page.getByLabel("POC Phone Number").fill(POC_PHONE);
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Full band member details")).toBeVisible({
    timeout: 10000,
  });

  // 4 members pre-created based on participant_count. Fill each.
  for (let i = 0; i < 4; i++) {
    // Select the participant card by its container class + position,
    // not by filtering on visible text (unreliable - see crew/dance-group
    // test fixes for why).
    const card = page
      .locator('div.rounded-xl.border.border-white\\/10.bg-bg-surface.overflow-hidden')
      .nth(i);

    // Expand if not already open
    await card.locator("button").first().click().catch(() => {});

    await card.getByLabel("Name").fill(`Round2 Member ${i + 1}`);
    await card
      .getByLabel("Phone")
      .fill(`98765430${String(i).padStart(2, "0")}`);
    await card
      .getByLabel("Email")
      .fill(`round2-member${i}-${Date.now()}@playwright-test.com`);
    await card.getByLabel("Age").fill("21");

    if (i === 0) {
      await card.getByLabel("Institution").fill("N/A");
    } else {
      await card.getByLabel(/Same as POC/i).check();
    }

    await card.locator('input[type="file"]').setInputFiles(
      path.join(__dirname, "fixtures", "test-id.jpg")
    );
  }

  await page.setInputFiles(
    'input[type="file"]:below(:text("Tech Rider"))',
    path.join(__dirname, "fixtures", "test-id.jpg")
  );

  await page.getByRole("button", { name: "Continue to Payment" }).click();

  await expect(page.getByText("₹1600")).toBeVisible(); // 4 x 400

  await page.setInputFiles(
    'input[type="file"]',
    path.join(__dirname, "fixtures", "test-payment.jpg")
  );

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("Round 2 complete!")).toBeVisible({
    timeout: 15000,
  });

  // Round 2 SHOULD generate and show a workshop coupon code - confirm
  // it's actually displayed on the success screen, not just saved
  // silently to the database.
  await expect(page.getByText(/coupon/i)).toBeVisible();
});
