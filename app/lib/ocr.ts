import { createWorker } from "tesseract.js";

/**
 * Runs OCR on an image/PDF buffer and returns extracted plain text.
 * Tesseract.js works directly on images; for PDFs you'd typically need
 * a page-to-image conversion step first (not included here) — if your
 * uploads accept PDFs (e.g. tech riders), this function will only work
 * reliably on image files (jpg/png). Flag PDF uploads for manual review
 * instead of attempting OCR on them.
 */
export async function runOcr(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Levenshtein edit distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Similarity score 0-100 between two strings based on edit distance,
 * normalized by the longer string's length.
 */
function similarity(a: string, b: string): number {
  const longer = Math.max(a.length, b.length);
  if (longer === 0) return 100;
  const dist = levenshtein(a, b);
  return Math.round((1 - dist / longer) * 100);
}

/**
 * Given OCR'd text from an ID document and the name entered on the
 * form, finds the best-matching substring in the OCR text and returns
 * a 0-100 confidence score. This is NOT exact matching — ID layouts
 * vary, OCR introduces noise, and name order/nicknames can differ.
 * Treat this as a signal for manual review, not an auto pass/fail.
 */
export function scoreNameMatch(ocrText: string, enteredName: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const name = normalize(enteredName);
  if (!name) return 0;

  // Break OCR text into lines and also into a sliding window of
  // word-groups roughly the same length as the entered name, since the
  // name could appear as a substring anywhere in a noisy text block.
  const lines = ocrText
    .split(/\r?\n/)
    .map(normalize)
    .filter(Boolean);

  const nameWordCount = name.split(" ").length;
  const candidates = new Set<string>(lines);

  const allWords = normalize(ocrText).split(" ").filter(Boolean);
  for (let i = 0; i <= allWords.length - nameWordCount; i++) {
    candidates.add(allWords.slice(i, i + nameWordCount).join(" "));
  }

  let best = 0;
  for (const candidate of candidates) {
    const score = similarity(candidate, name);
    if (score > best) best = score;
  }
  return best;
}

/**
 * Given OCR'd text from a payment screenshot and the expected amount,
 * searches for currency-like numeric patterns and checks whether any
 * of them match the expected amount. Returns the best-matching amount
 * found (or null if nothing plausible was found) and whether it
 * matches exactly.
 */
export function extractAndCheckAmount(
  ocrText: string,
  expectedAmount: number
): { detectedAmount: number | null; matches: boolean } {
  // Matches things like: ₹500, Rs.500, Rs 500, INR 500, 500.00, 500
  const pattern = /(?:₹|rs\.?|inr)?\s?(\d{2,6}(?:[.,]\d{1,2})?)/gi;
  const matches = [...ocrText.matchAll(pattern)];

  const candidates = matches
    .map((m) => parseFloat(m[1].replace(",", "")))
    .filter((n) => !isNaN(n));

  if (candidates.length === 0) {
    return { detectedAmount: null, matches: false };
  }

  const exactMatch = candidates.find(
    (n) => Math.round(n) === Math.round(expectedAmount)
  );

  if (exactMatch !== undefined) {
    return { detectedAmount: exactMatch, matches: true };
  }

  // No exact match — return the candidate closest to the expected
  // amount as a best guess, flagged as not matching.
  const closest = candidates.reduce((a, b) =>
    Math.abs(a - expectedAmount) < Math.abs(b - expectedAmount) ? a : b
  );
  return { detectedAmount: closest, matches: false };
}