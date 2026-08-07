"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import Waves from "@/app/components/Waves";

type Participant = {
  name: string;
  phone: string;
  email: string;
  institution: string;
  sameAsPoc: boolean;
  age: string;
  idProof: File | null;
};

const emptyParticipant = (): Participant => ({
  name: "",
  phone: "",
  email: "",
  institution: "",
  sameAsPoc: false,
  age: "",
  idProof: null,
});

const PRICE_PER_HEAD = 400;

export default function Round2Form() {
  const [stage, setStage] = useState<
    "lookup" | "members" | "payment" | "done"
  >("lookup");

  const [bandName, setBandName] = useState("");
  const [pocPhone, setPocPhone] = useState("");
  const [registration, setRegistration] = useState<any>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([
    emptyParticipant(),
  ]);
  const [openIndex, setOpenIndex] = useState(0);
  const [techRider, setTechRider] = useState<File | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLookup() {
    setLookingUp(true);
    setLookupError("");

    const { data, error: lookupErr } = await supabase
      .from("band_registrations")
      .select("*")
      .ilike("band_name", bandName.trim())
      .eq("poc_phone", pocPhone.trim())
      .maybeSingle();

    setLookingUp(false);

    if (lookupErr || !data) {
      setLookupError(
        "No matching Round 1 registration found. Check your band name and POC phone number."
      );
      return;
    }

    if (data.status !== "selected") {
      setLookupError(
        "This band hasn't been marked as selected for Round 2 yet. Please check our Instagram for results."
      );
      return;
    }

    if (data.round2_completed_at) {
      setLookupError("Round 2 has already been submitted for this band.");
      return;
    }

    setRegistration(data);
    // pre-fill member count worth of participant slots
    const count = data.participant_count || 1;
    setParticipants(
      Array.from({ length: count }, () => emptyParticipant())
    );
    setStage("members");
  }

  function updateParticipant(
    index: number,
    field: keyof Participant,
    value: string | File | null | boolean
  ) {
    setParticipants((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const updated = { ...p, [field]: value };
        if (field === "sameAsPoc" && value === true) {
          updated.institution = prev[0].institution;
        }
        return updated;
      })
    );
  }

  const canProceedToPayment =
    participants.every(
      (p) =>
        p.name && p.phone && p.email && p.institution && p.age && p.idProof
    ) && techRider;

  const total = participants.length * PRICE_PER_HEAD;

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
      if (techRider) {
        const techRiderPath = `${registration.id}/tech-rider-${techRider.name}`;
        await uploadFile(techRider, techRiderPath);
        await supabase
          .from("band_registrations")
          .update({ tech_rider_url: techRiderPath })
          .eq("id", registration.id);
      }

      const paymentPath = `${registration.id}/round2-payment-${paymentScreenshot.name}`;
      await uploadFile(paymentScreenshot, paymentPath);

      await supabase
        .from("band_registrations")
        .update({
          round2_amount_paid: total,
          round2_payment_screenshot_url: paymentPath,
          round2_completed_at: new Date().toISOString(),
        })
        .eq("id", registration.id);

      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (!p.idProof) continue;

        const idPath = `${registration.id}/participant-${i}-id-${p.idProof.name}`;
        await uploadFile(p.idProof, idPath);

        const { error: participantError } = await supabase
          .from("band_participants")
          .insert({
            registration_id: registration.id,
            name: p.name,
            phone: p.phone,
            email: p.email,
            institution: p.institution,
            age: parseInt(p.age),
            id_proof_url: idPath,
            is_primary_contact: i === 0,
          });

        if (participantError) throw participantError;
      }

      setStage("done");
    } catch (err: any) {
      console.error("Round 2 submission error:", err?.message || err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "done") {
    return (
      <main className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-text-primary mb-2">
            Round 2 complete!
          </h1>
          <p className="text-text-muted">
            {bandName} — see you at Veni, Vidi, Vici.
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
          Round 2 — Battle of the Bands
        </h1>
        <p className="text-text-muted mb-10">
          {stage === "lookup" && "Confirm your Round 1 registration"}
          {stage === "members" && "Full band member details"}
          {stage === "payment" && "Final payment"}
        </p>

        {stage === "lookup" && (
          <>
            <div className="space-y-4 mb-8">
              <Input label="Band Name" value={bandName} onChange={setBandName} />
              <Input
                label="POC Phone Number"
                type="tel"
                value={pocPhone}
                onChange={setPocPhone}
              />
            </div>

            {lookupError && (
              <p className="text-thermal-accent text-sm mb-4">{lookupError}</p>
            )}

            <button
              onClick={handleLookup}
              disabled={!bandName || !pocPhone || lookingUp}
              className="w-full px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70 disabled:cursor-not-allowed"
            >
              {lookingUp ? "Checking..." : "Continue"}
            </button>
          </>
        )}

        {stage === "members" && (
          <>
            <div className="space-y-4">
              {participants.map((p, i) => (
                <ParticipantCard
                  key={i}
                  index={i}
                  participant={p}
                  isOpen={openIndex === i}
                  isPrimary={i === 0}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                  onChange={(field, value) => updateParticipant(i, field, value)}
                />
              ))}
            </div>

            <div className="mt-8">
              <label className="block text-text-muted text-sm mb-1">
                Tech Rider (PDF or PNG)
              </label>
              <label className="flex items-center justify-between w-full rounded-lg bg-bg-surface border border-dashed border-white/20 px-4 py-3 cursor-pointer hover:border-thermal-accent transition-colors">
                <span className="text-text-muted text-sm truncate">
                  {techRider ? techRider.name : "Click to upload tech rider"}
                </span>
                <span className="text-thermal-accent text-sm flex-shrink-0 ml-3">
                  {techRider ? "Change" : "Upload"}
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/png"
                  onChange={(e) => setTechRider(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={() => setStage("payment")}
              disabled={!canProceedToPayment}
              className="w-full mt-8 px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </>
        )}

        {stage === "payment" && (
          <>
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 mb-6">
              <p className="text-text-muted text-sm uppercase tracking-wide mb-1">
                Total Amount
              </p>
              <p className="text-text-primary text-3xl font-semibold">
                ₹{total}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {participants.length} members × ₹{PRICE_PER_HEAD}
              </p>
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
                onClick={() => setStage("members")}
                className="flex-1 px-8 py-3 rounded-full border border-white/10 text-text-primary hover:border-thermal-accent transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ParticipantCard({
  index,
  participant,
  isOpen,
  isPrimary,
  onToggle,
  onChange,
}: {
  index: number;
  participant: Participant;
  isOpen: boolean;
  isPrimary: boolean;
  onToggle: () => void;
  onChange: (
    field: keyof Participant,
    value: string | File | null | boolean
  ) => void;
}) {
  const isFilled =
    participant.name &&
    participant.phone &&
    participant.email &&
    participant.institution &&
    participant.age &&
    participant.idProof;

  return (
    <div className="rounded-xl border border-white/10 bg-bg-surface overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-text-primary font-medium">
          {participant.name || `Member ${index + 1}`}
          {isPrimary && (
            <span className="text-thermal-accent text-xs ml-2 uppercase">
              Point of Contact
            </span>
          )}
        </span>
        <span className="text-text-muted text-sm">
          {isFilled ? "✓" : ""} {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 space-y-4">
          <Input
            label="Name"
            value={participant.name}
            onChange={(v) => onChange("name", v)}
          />
          <Input
            label="Phone"
            type="tel"
            value={participant.phone}
            onChange={(v) => onChange("phone", v)}
          />
          <Input
            label="Email"
            type="email"
            value={participant.email}
            onChange={(v) => onChange("email", v)}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-text-muted text-sm">
                Institution
              </label>
              {!isPrimary && (
                <label className="flex items-center gap-2 text-text-muted text-xs">
                  <input
                    type="checkbox"
                    checked={participant.sameAsPoc}
                    onChange={(e) => onChange("sameAsPoc", e.target.checked)}
                  />
                  Same as POC
                </label>
              )}
            </div>
            <p className="text-text-muted text-xs mb-1">
              Graduated or no current institution? Enter &quot;N/A&quot;.
            </p>
            <input
              type="text"
              value={participant.institution}
              onChange={(e) => onChange("institution", e.target.value)}
              disabled={!isPrimary && participant.sameAsPoc}
              className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none disabled:bg-thermal-accent/60 disabled:text-bg-base/70"
            />
          </div>

          <Input
            label="Age"
            type="number"
            value={participant.age}
            onChange={(v) => onChange("age", v)}
          />

          <div>
            <label className="block text-text-muted text-sm mb-1">
              Identity Proof (PDF or PNG)
            </label>
            <label className="flex items-center justify-between w-full rounded-lg bg-bg-base border border-dashed border-white/20 px-4 py-3 cursor-pointer hover:border-thermal-accent transition-colors">
              <span className="text-text-muted text-sm truncate">
                {participant.idProof
                  ? participant.idProof.name
                  : "Click to upload file"}
              </span>
              <span className="text-thermal-accent text-sm flex-shrink-0 ml-3">
                {participant.idProof ? "Change" : "Upload"}
              </span>
              <input
                type="file"
                accept="application/pdf,image/png"
                onChange={(e) =>
                  onChange("idProof", e.target.files?.[0] || null)
                }
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-text-muted text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
      />
    </div>
  );
}