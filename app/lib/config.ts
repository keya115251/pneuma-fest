export const PAYMENT_REQUIRED = true;

// The OCR verification webhook/pipeline isn't reliable yet, so hide its
// output (Payment Match, Needs Review, ID Match Score) from the admin
// dashboard until it's actually working. Flip to true to re-enable.
export const SHOW_OCR_VERIFICATION = false;

// Confirmation emails go here (not to registrants) until a verified
// sending domain is set up in Resend. See app/api/send-confirmation/route.ts.
export const TEAM_NOTIFICATION_EMAIL = "dyuthi.cbit@gmail.com";
