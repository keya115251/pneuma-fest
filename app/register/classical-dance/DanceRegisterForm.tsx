"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import type { FestEvent } from "@/app/data/events";
import Waves from "@/app/components/Waves";

type Participant = {
  name: string;
  contact: string;
  email: string;
  age: string;
  institution: string;
  sameAsHead: boolean;
  idProof: File | null;
};

const emptyParticipant = (): Participant => ({
  name: "",
  contact: "",
  email: "",
  age: "",
  institution: "",
  sameAsHead: false,
  idProof: null,
});

const DANCE_FORMS = [
  "Kuchipudi",
  "Bharatanatyam",
  "Kathak",
  "Kathakali",
  "Mohiniyattam",
  "Odissi",
  "Manipuri",
  "Sattriya",
];

const PRICE_PER_HEAD = 500;
const MAX_GROUP_SIZE = 10;

export default function DanceRegisterForm({ event }: { event: FestEvent }) {
  const [step, setStep] = useState<
    "details" | "participants" | "payment" | "done"
  >("details");

  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [email, setEmail] = useState("");
  const [ageGroup, setAgeGroup] = useState<"junior" | "senior">("junior");
  const [danceForm, setDanceForm] = useState(DANCE_FORMS[0]);
  const [performanceType, setPerformanceType] = useState<"solo" | "group">(
    "solo"
  );

  const [participants, setParticipants] = useState<Participant[]>([
    emptyParticipant(),
  ]);
  const [openIndex, setOpenIndex] = useState(0);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateParticipant(
    index: number,
    field: keyof Participant,
    value: string | File | null | boolean
  ) {
    setParticipants((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const updated = { ...p, [field]: value };
        if (field === "sameAsHead" && value === true) {
          updated.institution = prev[0].institution;
        }
        return updated;
      })
    );
  }

  function addParticipant() {
    if (participants.length >= MAX_GROUP_SIZE) return;
    setParticipants((prev) => [...prev, emptyParticipant()]);
    setOpenIndex(participants.length);
  }

  function removeParticipant(index: number) {
    if (participants.length <= 1) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
    setOpenIndex(0);
  }

  const canProceedToParticipants = city && stateName && email;

  const canProceedToPayment = participants.every((p) => {
    if (performanceType === "solo") {
      return p.name && p.institution && p.idProof;
    }
    return p.name && p.contact && p.email && p.age && p.institution && p.idProof;
  });

  const total = participants.length * PRICE_PER_HEAD;

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
        .from("dance_registrations")
        .insert({
          performance_type: performanceType,
          dance_form: danceForm,
          age_group: ageGroup,
          city,
          state: stateName,
          email,
          participant_count: participants.length,
          amount_paid: total,
        })
        .select()
        .single();

      if (regError || !registration) throw regError;

      const paymentPath = `${registration.id}/payment-screenshot-${paymentScreenshot.name}`;
      await uploadFile(paymentScreenshot, paymentPath);
      await supabase
        .from("dance_registrations")
        .update({ payment_screenshot_url: paymentPath })
        .eq("id", registration.id);

      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (!p.idProof) continue;

        const idPath = `${registration.id}/participant-${i}-id-${p.idProof.name}`;
        await uploadFile(p.idProof, idPath);

        const { error: participantError } = await supabase
          .from("dance_participants")
          .insert({
            registration_id: registration.id,
            name: p.name,
            contact: p.contact || null,
            email: p.email || null,
            age: p.age ? parseInt(p.age) : null,
            institution: p.institution,
            id_proof_url: idPath,
            is_head: i === 0,
          });

        if (participantError) throw participantError;
      }

      setStep("done");
    } catch (err) {
      console.error(err);
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
          <p className="text-text-muted">
            {event.name} — {performanceType === "solo" ? "Solo" : `Group of ${participants.length}`}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
    <Waves
      lineColor="rgba(245,198,224,0.3)"
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
          Register — {event.title}
        </h1>
        <p className="text-text-muted mb-10">
          {step === "details" && "Performance details"}
          {step === "participants" &&
            (performanceType === "solo" ? "Your details" : "Group members")}
          {step === "payment" && "Payment"}
        </p>

        {step === "details" && (
          <>
            <div className="space-y-4 mb-8">
              <Input label="City" value={city} onChange={setCity} />
              <Input label="State" value={stateName} onChange={setStateName} />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
              />

              <div>
                <label className="block text-text-muted text-sm mb-2">
                  Age Group
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-text-muted text-sm">
                    <input
                      type="radio"
                      checked={ageGroup === "junior"}
                      onChange={() => setAgeGroup("junior")}
                      className="cursor-target w-5 h-5"
                    />
                    Junior (up to 10th grade)
                  </label>
                  <label className="flex items-center gap-2 text-text-muted text-sm">
                    <input
                      type="radio"
                      checked={ageGroup === "senior"}
                      onChange={() => setAgeGroup("senior")}
                      className="cursor-target w-5 h-5"
                    />
                    Senior (11th grade onward)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-1">
                  Classical Dance Form
                </label>
                <select
                  value={danceForm}
                  onChange={(e) => setDanceForm(e.target.value)}
                  className="cursor-target w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
                >
                  {DANCE_FORMS.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-2">
                  Performance
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-text-muted text-sm">
                    <input
                      type="radio"
                      checked={performanceType === "solo"}
                      onChange={() => {
                        setPerformanceType("solo");
                        setParticipants([emptyParticipant()]);
                      }}
                      className="cursor-target w-5 h-5"
                    />
                    Solo
                  </label>
                  <label className="flex items-center gap-2 text-text-muted text-sm">
                    <input
                      type="radio"
                      checked={performanceType === "group"}
                      onChange={() => setPerformanceType("group")}
                      className="cursor-target w-5 h-5"
                    />
                    Group
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("participants")}
              disabled={!canProceedToParticipants}
              className="w-full px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </>
        )}

        {step === "participants" && (
          <>
            <div className="space-y-4">
              {participants.map((p, i) => (
                <ParticipantCard
                  key={i}
                  index={i}
                  participant={p}
                  isOpen={openIndex === i}
                  isHead={i === 0}
                  isSolo={performanceType === "solo"}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                  onChange={(field, value) => updateParticipant(i, field, value)}
                  onRemove={() => removeParticipant(i)}
                  canRemove={participants.length > 1}
                />
              ))}
            </div>

            {performanceType === "group" && participants.length < MAX_GROUP_SIZE && (
              <button
                onClick={addParticipant}
                className="mt-4 w-full rounded-xl border border-dashed border-white/20 py-3 text-text-muted hover:border-thermal-accent hover:text-thermal-accent transition-colors"
              >
                + Add Member
              </button>
            )}

            {performanceType === "group" && (
              <p className="text-text-muted text-sm mt-4">
                {participants.length} / {MAX_GROUP_SIZE} members
              </p>
            )}

            <button
              onClick={() => setStep("payment")}
              disabled={!canProceedToPayment}
              className="w-full mt-8 px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </>
        )}

        {step === "payment" && (
          <>
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 mb-6">
              <p className="text-text-muted text-sm uppercase tracking-wide mb-1">
                Total Amount
              </p>
              <p className="text-text-primary text-3xl font-semibold">
                ₹{total}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {participants.length} × ₹{PRICE_PER_HEAD}
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
                  className="hidden cursor-target"
                />
              </label>
            </div>

            {error && <p className="text-thermal-accent text-sm mb-4">{error}</p>}

            <div className="flex gap-4">
              <button
                onClick={() => setStep("participants")}
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

function ParticipantCard({
  index,
  participant,
  isOpen,
  isHead,
  isSolo,
  onToggle,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  participant: Participant;
  isOpen: boolean;
  isHead: boolean;
  isSolo: boolean;
  onToggle: () => void;
  onChange: (
    field: keyof Participant,
    value: string | File | null | boolean
  ) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const isFilled = isSolo
    ? participant.name && participant.institution && participant.idProof
    : participant.name &&
      participant.contact &&
      participant.email &&
      participant.age &&
      participant.institution &&
      participant.idProof;

  return (
    <div className="rounded-xl border border-white/10 bg-bg-surface overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-text-primary font-medium">
          {participant.name || (isSolo ? "Your details" : `Member ${index + 1}`)}
          {isHead && !isSolo && (
            <span className="text-thermal-accent text-xs ml-2 uppercase">
              Group Head
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

          {!isSolo && (
            <>
              <Input
                label="Contact"
                type="tel"
                value={participant.contact}
                onChange={(v) => onChange("contact", v)}
              />
              <Input
                label="Email"
                type="email"
                value={participant.email}
                onChange={(v) => onChange("email", v)}
              />
              <Input
                label="Age"
                type="number"
                value={participant.age}
                onChange={(v) => onChange("age", v)}
              />
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-text-muted text-sm">
                Institution
              </label>
              {!isHead && !isSolo && (
                <label className="flex items-center gap-2 text-text-muted text-xs">
                  <input
                    type="checkbox"
                    checked={participant.sameAsHead}
                    onChange={(e) => onChange("sameAsHead", e.target.checked)}
                    className="cursor-target w-5 h-5"
                  />
                  Same as Group Leader
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
              disabled={!isHead && participant.sameAsHead}
              className="cursor-target w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none disabled:bg-thermal-accent/60 disabled:text-bg-base/70"
            />
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">
              ID Card (PDF or PNG)
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
                className="hidden cursor-target"
              />
            </label>
          </div>

          {canRemove && !isSolo && (
            <button
              onClick={onRemove}
              className="text-thermal-accent text-sm hover:underline"
            >
              Remove member
            </button>
          )}
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
        className="cursor-target w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
      />
    </div>
  );
}