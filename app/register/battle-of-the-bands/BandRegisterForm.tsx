"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import Waves from "@/app/components/Waves";

const ROUND1_FEE = 100;

export default function BandRegisterForm() {
  const [step, setStep] = useState<"details" | "payment" | "done">("details");

  const [bandName, setBandName] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [videoLink, setVideoLink] = useState("");

  const [pocName, setPocName] = useState("");
  const [pocPhone, setPocPhone] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [pocInstitution, setPocInstitution] = useState("");
  const [pocIdProof, setPocIdProof] = useState<File | null>(null);

  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const memberCountNum = parseInt(memberCount);
const isValidMemberCount =
  memberCount !== "" && memberCountNum >= 3 && memberCountNum <= 10;

const canProceedToPayment =
  bandName &&
  isValidMemberCount &&
  city &&
  stateName &&
  videoLink &&
  pocName &&
  pocPhone &&
  pocEmail &&
  pocInstitution &&
  pocIdProof;

  async function uploadFile(file: File, path: string) {
    const { error: uploadError } = await supabase.storage
      .from("registration-uploads")
      .upload(path, file);
    if (uploadError) throw uploadError;
    return path;
  }

  async function handleSubmit() {
    if (!paymentScreenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data: registration, error: regError } = await supabase
        .from("band_registrations")
        .insert({
          band_name: bandName,
          participant_count: parseInt(memberCount),
          city,
          state: stateName,
          video_link: videoLink,
          poc_name: pocName,
          poc_phone: pocPhone,
          poc_email: pocEmail,
          poc_institution: pocInstitution,
          amount_paid: ROUND1_FEE,
          status: "pending",
        })
        .select()
        .single();

      if (regError || !registration) throw regError;

      if (pocIdProof) {
        const idPath = `${registration.id}/poc-id-${pocIdProof.name}`;
        await uploadFile(pocIdProof, idPath);
        await supabase
          .from("band_registrations")
          .update({ poc_id_proof_url: idPath })
          .eq("id", registration.id);
      }

      const paymentPath = `${registration.id}/payment-screenshot-${paymentScreenshot.name}`;
      await uploadFile(paymentScreenshot, paymentPath);
      await supabase
        .from("band_registrations")
        .update({ payment_screenshot_url: paymentPath })
        .eq("id", registration.id);

      setStep("done");
    } catch (err: any) {
      console.error("Registration error:", err?.message || err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <main className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-text-primary mb-2">
            You&apos;re registered!
          </h1>
          <p className="text-text-muted mb-1">Veni, Vidi, Vici.</p>
          <p className="text-text-muted mb-1">Battle of the Bands</p>
          <p className="text-text-muted">
            {bandName} — {memberCount} members
          </p>
          <p className="text-text-muted text-sm mt-4">
            Selection results will be announced on our Instagram page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
    <Waves
      lineColor="rgba(180,151,207,0.3)"
      backgroundColor="transparent"
      waveSpeedX={0.015}
      waveSpeedY={0.008}
      waveAmpX={30}
      waveAmpY={15}
      friction={0.9}
      tension={0.008}
      maxCursorMove={100}
      xGap={14}
      yGap={34}
    />
  </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl text-text-primary mb-2">
          Register — Veni, Vidi, Vici.
        </h1>
        <p className="text-text-muted mb-10">
          {step === "details" && "Round 1 — Entry Details"}
          {step === "payment" && "Payment"}
        </p>

        {step === "details" && (
          <>
            <div className="space-y-4 mb-8">
              <Input label="Band Name" value={bandName} onChange={setBandName} />
              <div>
  <Input
    label="Number of Members"
    type="number"
    value={memberCount}
    onChange={setMemberCount}
  />
  <p className="text-text-muted text-xs mt-1">
    Bands must have 3–10 members.
  </p>
  {memberCount !== "" && !isValidMemberCount && (
    <p className="text-thermal-accent text-xs mt-1">
      Please enter a number between 3 and 10.
    </p>
  )}
</div>
              <Input label="City" value={city} onChange={setCity} />
              <Input label="State" value={stateName} onChange={setStateName} />
              <Input
                label="Performance / Practice Video (Google Drive link)"
                value={videoLink}
                onChange={setVideoLink}
              />
            </div>

            <h2 className="text-lg font-semibold text-thermal-accent mb-4">
              Point of Contact
            </h2>
            <div className="space-y-4 mb-8">
              <Input label="Name" value={pocName} onChange={setPocName} />
              <Input
                label="Phone"
                type="tel"
                value={pocPhone}
                onChange={setPocPhone}
              />
              <Input
                label="Email"
                type="email"
                value={pocEmail}
                onChange={setPocEmail}
              />
              <Input
                label="Institution"
                value={pocInstitution}
                onChange={setPocInstitution}
                hint='Graduated or no current institution? Enter "N/A".'
              />

              <div>
                <label className="block text-text-muted text-sm mb-1">
                  Identity Proof (PDF or PNG)
                </label>
                <label className="flex items-center justify-between w-full rounded-lg bg-bg-surface border border-dashed border-white/20 px-4 py-3 cursor-pointer hover:border-thermal-accent transition-colors">
                  <span className="text-text-muted text-sm truncate">
                    {pocIdProof ? pocIdProof.name : "Click to upload file"}
                  </span>
                  <span className="text-thermal-accent text-sm flex-shrink-0 ml-3">
                    {pocIdProof ? "Change" : "Upload"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,image/png"
                    onChange={(e) =>
                      setPocIdProof(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={() => setStep("payment")}
              disabled={!canProceedToPayment}
              className="w-full px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </>
        )}

        {step === "payment" && (
          <>
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 mb-6">
              <p className="text-text-muted text-sm uppercase tracking-wide mb-1">
                Round 1 Entry Fee
              </p>
              <p className="text-text-primary text-3xl font-semibold">
                ₹{ROUND1_FEE}
              </p>
              <p className="text-text-muted text-sm mt-1">Flat fee per band</p>
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

            <div className="flex gap-4">
              <button
                onClick={() => setStep("details")}
                className="flex-1 px-8 py-3 rounded-full border border-white/10 text-text-primary hover:border-thermal-accent transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70"
              >
                {submitting ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-text-muted text-sm mb-1">{label}</label>
      {hint && <p className="text-text-muted text-xs mb-1">{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
      />
    </div>
  );
}