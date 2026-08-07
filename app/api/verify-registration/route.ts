import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase/admin";
import { runOcr, scoreNameMatch, extractAndCheckAmount } from "@/app/lib/ocr";

const NAME_MATCH_THRESHOLD = 70;
const STORAGE_BUCKET = "registration-uploads";

type IdCheckConfig = { urlColumn: string; nameColumn: string };

type PaymentCheckConfig = {
  urlColumn: string;
  amountColumn: string; // read the EXPECTED amount from the row itself,
  // since your forms already compute the correct total at submission
  // time (per-head pricing, crew flat fee, etc.) - never hardcode a
  // fixed rupee amount here.
  detectedColumn: string;
  matchesColumn: string;
  processedColumn: string; // separate per payment "event" so multi-round
  // tables (like band_registrations) don't clobber each other's status
  reviewColumn: string;
};

type TableConfig = {
  idCheck?: IdCheckConfig;
  paymentChecks?: PaymentCheckConfig[]; // array - most tables have one,
  // band_registrations has two independent ones (Round 1 + Round 2)
};

const TABLE_CONFIG: Record<string, TableConfig> = {
  dance_participants: {
    idCheck: { urlColumn: "id_proof_url", nameColumn: "name" },
  },
  band_participants: {
    idCheck: { urlColumn: "id_proof_url", nameColumn: "name" },
  },
  crew_members: {
    idCheck: { urlColumn: "id_proof_url", nameColumn: "name" },
  },
  dance_registrations: {
    paymentChecks: [
      {
        urlColumn: "payment_screenshot_url",
        amountColumn: "amount_paid",
        detectedColumn: "payment_amount_detected",
        matchesColumn: "payment_amount_matches",
        processedColumn: "ocr_processed_at",
        reviewColumn: "needs_review",
      },
    ],
  },
  crew_registrations: {
    paymentChecks: [
      {
        urlColumn: "payment_screenshot_url",
        amountColumn: "amount_paid",
        detectedColumn: "payment_amount_detected",
        matchesColumn: "payment_amount_matches",
        processedColumn: "ocr_processed_at",
        reviewColumn: "needs_review",
      },
    ],
  },
  band_registrations: {
    paymentChecks: [
      {
        urlColumn: "payment_screenshot_url",
        amountColumn: "amount_paid",
        detectedColumn: "payment_amount_detected",
        matchesColumn: "payment_amount_matches",
        processedColumn: "ocr_processed_at",
        reviewColumn: "needs_review",
      },
      {
        urlColumn: "round2_payment_screenshot_url",
        amountColumn: "round2_amount_paid",
        detectedColumn: "round2_payment_amount_detected",
        matchesColumn: "round2_payment_amount_matches",
        processedColumn: "round2_ocr_processed_at",
        reviewColumn: "round2_needs_review",
      },
    ],
  },
  audience_registrations: {
    // No idCheck here - the Audience form never collects an ID upload,
    // only name/age/institution/phone/email + payment. Verified against
    // the actual audience_registrations schema, which has no
    // id_proof_url column.
    paymentChecks: [
      {
        urlColumn: "payment_screenshot_url",
        amountColumn: "amount_paid",
        detectedColumn: "payment_amount_detected",
        matchesColumn: "payment_amount_matches",
        processedColumn: "ocr_processed_at",
        reviewColumn: "needs_review",
      },
    ],
  },
};

type SupabaseWebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, any>;
  old_record?: Record<string, any>;
};

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as SupabaseWebhookPayload;
  const { table, record } = payload;

  const config = TABLE_CONFIG[table];
  if (!config) {
    return NextResponse.json({ skipped: true, reason: "unconfigured table" });
  }

  const updates: Record<string, any> = {};

  try {
    if (
      config.idCheck &&
      record[config.idCheck.urlColumn] &&
      !record.ocr_processed_at
    ) {
      const buffer = await downloadFile(record[config.idCheck.urlColumn]);
      const text = await runOcr(buffer);
      const score = scoreNameMatch(text, record[config.idCheck.nameColumn] ?? "");

      updates.id_name_match_score = score;
      if (score < NAME_MATCH_THRESHOLD) updates.needs_review = true;
    }

    if (config.paymentChecks) {
      for (const check of config.paymentChecks) {
        // Each payment check has its own processed flag, so Round 1 and
        // Round 2 (or any future multi-payment table) never block each
        // other - they're genuinely independent events.
        if (!record[check.urlColumn] || record[check.processedColumn]) {
          continue;
        }

        const expectedAmount = record[check.amountColumn];
        if (expectedAmount == null) {
          console.warn(
            `${table}/${record.id}: no value in ${check.amountColumn}, skipping payment check`
          );
          continue;
        }

        const buffer = await downloadFile(record[check.urlColumn]);
        const text = await runOcr(buffer);
        const { detectedAmount, matches } = extractAndCheckAmount(
          text,
          expectedAmount
        );

        updates[check.detectedColumn] = detectedAmount;
        updates[check.matchesColumn] = matches;
        updates[check.processedColumn] = new Date().toISOString();
        if (!matches) updates[check.reviewColumn] = true;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ skipped: true, reason: "nothing to process" });
    }

    // idCheck writes to the shared ocr_processed_at/needs_review columns;
    // set those if this run touched the ID check and they weren't
    // already set by a payment check above.
    if (config.idCheck && record[config.idCheck.urlColumn] && !updates.ocr_processed_at) {
      updates.ocr_processed_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from(table)
      .update(updates)
      .eq("id", record.id);

    if (error) throw error;

    return NextResponse.json({ ok: true, updates });
  } catch (err) {
    console.error(`OCR verification failed for ${table}/${record.id}:`, err);
    await supabaseAdmin
      .from(table)
      .update({ needs_review: true, ocr_processed_at: new Date().toISOString() })
      .eq("id", record.id);

    return NextResponse.json(
      { ok: false, error: "OCR processing failed, flagged for review" },
      { status: 200 }
    );
  }
}

async function downloadFile(storagePath: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Failed to download ${storagePath}: ${error?.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}