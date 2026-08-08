"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

type RegistrationType = "dance" | "crew" | "band" | "audience";

const TABLE_MAP: Record<RegistrationType, string> = {
  dance: "dance_registrations",
  crew: "crew_registrations",
  band: "band_registrations",
  audience: "audience_registrations",
};

const EMAIL_COLUMN_MAP: Record<RegistrationType, string> = {
  dance: "email",
  crew: "email", // crew_registrations itself has no email column directly -
  // see note below, this is handled via a join-style lookup instead.
  band: "poc_email",
  audience: "email",
};

const LABEL_MAP: Record<RegistrationType, string> = {
  dance: "Aangikam (Classical Dance)",
  crew: "3T's (Hip-Hop)",
  band: "Veni, Vidi, Vici. (Battle of the Bands)",
  audience: "Audience Pass",
};

export default function CompletePaymentPage() {
  const [stage, setStage] = useState<"lookup" | "payment" | "done">("lookup");
  const [type, setType] = useState<RegistrationType>("dance");
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState<any>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLookup() {
    setLookingUp(true);
    setLookupError("");

    const table = TABLE_MAP[type];

    let query;
    if (type === "crew") {
      // crew_registrations has no email column - the email lives on
      // crew_members (the leader's row). Look up via the leader instead.
      const { data: leader, error: leaderErr } = await supabase
        .from("crew_members")
        .select("registration_id")
        .eq("email", email.trim())
        .eq("is_leader", true)
        .maybeSingle();

      if (leaderErr || !leader) {
        setLookupError(
          "No matching registration found for that email. Double check you entered the Crew Leader's email."
        );
        setLookingUp(false);
        return;
      }

      const { data, error: regErr } = await supabase
        .from("crew_registrations")
        .select("*")
        .eq("id", leader.registration_id)
        .maybeSingle();

      query = { data, error: regErr };
    } else {
      const column = EMAIL_COLUMN_MAP[type];
      const { data, error: regErr } = await supabase
        .from(table)
        .select("*")
        .eq(column, email.trim())
        .maybeSingle();
      query = { data, error: regErr };
    }

    setLookingUp(false);

    if (query.error || !query.data) {
      setLookupError(
        "No matching registration found. Double check your registration type and email."
      );
      return;
    }

    if (!query.data.payment_pending) {
      setLookupError("Payment has already been completed for this registration.");
      return;
    }

    setRegistration(query.data);
    setStage("payment");
  }

  async function uploadFile(file: File, path: string) {
    const { error: uploadError } = await supabase.storage
      .from("registration-uploads")
      .upload(path, file);
    if (uploadError) throw uploadError;
    return path;
  }

  async function handleSubmit() {
    if (!paymentScreenshot || !registration) {
      setError("Please upload your payment screenshot.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const table = TABLE_MAP[type];
      const paymentPath = `${registration.id}/payment-screenshot-${paymentScreenshot.name}`;
      await uploadFile(paymentScreenshot, paymentPath);

      const { error: updateError } = await supabase
        .from(table)
        .update({
          payment_screenshot_url: paymentPath,
          payment_pending: false,
        })
        .eq("id", registration.id);

      if (updateError) throw updateError;

      setStage("done");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "done") {
    return (
      <main className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-text-primary mb-2">
            Payment received!
          </h1>
          <p className="text-text-muted">
            Your registration for {LABEL_MAP[type]} is now fully complete.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20">
      <div className="relative z-10 max-w-md mx-auto">
        <h1 className="font-heading text-3xl text-text-primary mb-2">
          Complete Payment
        </h1>
        <p className="text-text-muted mb-8">
          Finish payment for a registration submitted earlier.
        </p>

        {stage === "lookup" && (
          <>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-text-muted text-sm mb-1">
                  Registration Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as RegistrationType)}
                  className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
                >
                  <option value="dance">Aangikam (Classical Dance)</option>
                  <option value="crew">3T's (Hip-Hop)</option>
                  <option value="band">Veni, Vidi, Vici. (Battle of the Bands)</option>
                  <option value="audience">Audience Pass</option>
                </select>
                {type === "crew" && (
                  <p className="text-text-muted text-xs mt-1">
                    Enter the Crew Leader&apos;s email.
                  </p>
                )}
                {type === "band" && (
                  <p className="text-text-muted text-xs mt-1">
                    Enter the Point of Contact&apos;s email.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-1">
                  Email used at registration
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
                />
              </div>
            </div>

            {lookupError && (
              <p className="text-thermal-accent text-sm mb-4">{lookupError}</p>
            )}

            <button
              onClick={handleLookup}
              disabled={!email || lookingUp}
              className="w-full px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70 disabled:cursor-not-allowed"
            >
              {lookingUp ? "Checking..." : "Find My Registration"}
            </button>
          </>
        )}

        {stage === "payment" && registration && (
          <>
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 mb-6">
              <p className="text-text-muted text-sm uppercase tracking-wide mb-1">
                Amount Due
              </p>
              <p className="text-text-primary text-3xl font-semibold">
                ₹{registration.amount_paid}
              </p>
              <p className="text-text-muted text-sm mt-1">{LABEL_MAP[type]}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 mb-6 flex flex-col items-center">
              <p className="text-text-muted text-sm mb-4">Scan to pay</p>
              <div className="w-48 h-48 bg-white/10 border border-dashed border-white/20 rounded-lg flex items-center justify-center text-text-muted text-sm">
                QR Placeholder
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-text-muted text-sm mb-1">
                Payment Screenshot
              </label>
              <label className="flex items-center justify-between w-full rounded-lg bg-bg-surface border border-dashed border-white/20 px-4 py-3 cursor-pointer hover:border-thermal-accent transition-colors">
                <span className="text-text-muted text-sm truncate">
                  {paymentScreenshot
                    ? paymentScreenshot.name
                    : "Click to upload screenshot"}
                </span>
                <span className="text-thermal-accent text-sm flex-shrink-0 ml-3">
                  {paymentScreenshot ? "Change" : "Upload"}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setPaymentScreenshot(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </label>
            </div>

            {error && <p className="text-thermal-accent text-sm mb-4">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70"
            >
              {submitting ? "Submitting..." : "Submit Payment"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}