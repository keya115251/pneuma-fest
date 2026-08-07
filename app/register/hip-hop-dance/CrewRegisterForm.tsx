"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import type { FestEvent } from "@/app/data/events";
import Waves from "@/app/components/Waves";

type Member = {
  name: string;
  phone: string;
  email: string;
  institution: string;
  sameAsPoc: boolean;
  idProof: File | null;
};

const emptyMember = (): Member => ({
  name: "",
  phone: "",
  email: "",
  institution: "",
  sameAsPoc: false,
  idProof: null,
});

const PRICE_FLAT = 3000;
const MIN_MEMBERS = 8;
const MAX_MEMBERS = 20;

export default function CrewRegisterForm({ event }: { event: FestEvent }) {
  const [step, setStep] = useState<
    "groupInfo" | "members" | "payment" | "done"
  >("groupInfo");

  const [crewName, setCrewName] = useState("");
  const [category, setCategory] = useState<"open" | "college">("college");
  const [institution, setInstitution] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [performanceDuration, setPerformanceDuration] = useState("");
  const [propsUsed, setPropsUsed] = useState(false);
  const [propsDetails, setPropsDetails] = useState("");
  const [declaration1, setDeclaration1] = useState(false);
  const [declaration2, setDeclaration2] = useState(false);

  const [members, setMembers] = useState<Member[]>([emptyMember()]);
  const [openIndex, setOpenIndex] = useState(0);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateMember(
    index: number,
    field: keyof Member,
    value: string | File | null | boolean
  ) {
    setMembers((prev) =>
      prev.map((m, i) => {
        if (i !== index) return m;
        const updated = { ...m, [field]: value };
        if (field === "sameAsPoc" && value === true) {
          updated.institution = prev[0].institution;
        }
        return updated;
      })
    );
  }

  function addMember() {
    if (members.length >= MAX_MEMBERS) return;
    setMembers((prev) => [...prev, emptyMember()]);
    setOpenIndex(members.length);
  }

  function removeMember(index: number) {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
    setOpenIndex(0);
  }

  const canProceedToMembers =
    crewName && city && stateName && (category === "open" || institution);

  const canProceedToPayment =
    members.length >= MIN_MEMBERS &&
    members.every(
      (m) => m.name && m.phone && m.email && m.institution && m.idProof
    ) &&
    performanceDuration &&
    (!propsUsed || propsDetails) &&
    declaration1 &&
    declaration2;

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
        .from("crew_registrations")
        .insert({
          crew_name: crewName,
          institution: category === "college" ? institution : null,
          city,
          state: stateName,
          category,
          member_count: members.length,
          performance_duration: performanceDuration,
          props_used: propsUsed,
          props_details: propsUsed ? propsDetails : null,
          amount_paid: PRICE_FLAT,
        })
        .select()
        .single();

      if (regError || !registration) throw regError;

      const paymentPath = `${registration.id}/payment-screenshot-${paymentScreenshot.name}`;
      await uploadFile(paymentScreenshot, paymentPath);
      await supabase
        .from("crew_registrations")
        .update({ payment_screenshot_url: paymentPath })
        .eq("id", registration.id);

      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.idProof) continue;

        const idPath = `${registration.id}/member-${i}-id-${m.idProof.name}`;
        await uploadFile(m.idProof, idPath);

        const { error: memberError } = await supabase
          .from("crew_members")
          .insert({
            registration_id: registration.id,
            name: m.name,
            phone: m.phone,
            email: m.email,
            institution: m.institution,
            id_proof_url: idPath,
            is_leader: i === 0,
          });

        if (memberError) throw memberError;
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
            {event.name} — {members.length} members
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
    <Waves
      lineColor="rgba(77,61,255,0.3)"
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
          Register — {event.name}
        </h1>
        <p className="text-text-muted mb-10">
          {step === "groupInfo" && "Crew details"}
          {step === "members" &&
            `Add crew members (${MIN_MEMBERS}–${MAX_MEMBERS})`}
          {step === "payment" && "Payment"}
        </p>

        {step === "groupInfo" && (
          <>
            <div className="space-y-4 mb-8">
              <Input label="Crew Name" value={crewName} onChange={setCrewName} />

              <div>
                <label className="block text-text-muted text-sm mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as "open" | "college")
                  }
                  className="cursor-target w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
                >
                  <option value="college">College Crew</option>
                  <option value="open">Open Crew</option>
                </select>
              </div>

              {category === "college" && (
                <Input
                  label="College / University Name"
                  value={institution}
                  onChange={setInstitution}
                />
              )}

              <Input label="City" value={city} onChange={setCity} />
              <Input label="State" value={stateName} onChange={setStateName} />
            </div>

            <button
              onClick={() => setStep("members")}
              disabled={!canProceedToMembers}
              className="w-full px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </>
        )}

        {step === "members" && (
          <>
            <div className="space-y-4">
              {members.map((m, i) => (
                <MemberCard
                  key={i}
                  index={i}
                  member={m}
                  isOpen={openIndex === i}
                  isLeader={i === 0}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                  onChange={(field, value) => updateMember(i, field, value)}
                  onRemove={() => removeMember(i)}
                  canRemove={members.length > 1}
                />
              ))}
            </div>

            {members.length < MAX_MEMBERS && (
              <button
                onClick={addMember}
                className="mt-4 w-full rounded-xl border border-dashed border-white/20 py-3 text-text-muted hover:border-thermal-accent hover:text-thermal-accent transition-colors"
              >
                + Add Member
              </button>
            )}

            <p className="text-text-muted text-sm mt-4">
              {members.length} / {MAX_MEMBERS} members
              {members.length < MIN_MEMBERS &&
                ` — minimum ${MIN_MEMBERS} required`}
            </p>

            <div className="mt-8 space-y-4">
              <Input
                label="Performance Duration"
                value={performanceDuration}
                onChange={setPerformanceDuration}
              />

              <div>
                <label className="block text-text-muted text-sm mb-2">
                  Props used in performance?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-text-muted text-sm">
                    <input
                      type="radio"
                      checked={propsUsed}
                      onChange={() => setPropsUsed(true)}
                      className="cursor-target w-5 h-5"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-text-muted text-sm">
                    <input
                      type="radio"
                      checked={!propsUsed}
                      onChange={() => setPropsUsed(false)}
                      className="cursor-target w-5 h-5"
                    />
                    No
                  </label>
                </div>
              </div>

              {propsUsed && (
                <Input
                  label="Specify Props"
                  value={propsDetails}
                  onChange={setPropsDetails}
                />
              )}
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-start gap-2 text-text-muted text-sm">
                <input
                  type="checkbox"
                  checked={declaration1}
                  onChange={(e) => setDeclaration1(e.target.checked)}
                  className="mt-1 cursor-target w-5 h-5"
                />
                We agree to abide by the rules and regulations of the
                competition.
              </label>
              <label className="flex items-start gap-2 text-text-muted text-sm">
                <input
                  type="checkbox"
                  checked={declaration2}
                  onChange={(e) => setDeclaration2(e.target.checked)}
                  className="mt-1 cursor-target w-5 h-5"
                />
                All information provided is accurate.
              </label>
            </div>

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
                ₹{PRICE_FLAT}
              </p>
              <p className="text-text-muted text-sm mt-1">Flat fee per crew</p>
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
                onClick={() => setStep("members")}
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

function MemberCard({
  index,
  member,
  isOpen,
  isLeader,
  onToggle,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  member: Member;
  isOpen: boolean;
  isLeader: boolean;
  onToggle: () => void;
  onChange: (
    field: keyof Member,
    value: string | File | null | boolean
  ) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const isFilled =
    member.name && member.phone && member.email && member.institution && member.idProof;

  return (
    <div className="rounded-xl border border-white/10 bg-bg-surface overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-text-primary font-medium">
          {member.name || `Member ${index + 1}`}
          {isLeader && (
            <span className="text-thermal-accent text-xs ml-2 uppercase">
              Crew Leader
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
            value={member.name}
            onChange={(v) => onChange("name", v)}
          />
          <Input
            label="Phone"
            type="tel"
            value={member.phone}
            onChange={(v) => onChange("phone", v)}
          />
          <Input
            label="Email"
            type="email"
            value={member.email}
            onChange={(v) => onChange("email", v)}
          />

<div>
  <div className="flex items-center justify-between mb-1">
    <label className="block text-text-muted text-sm">Institution</label>
    {!isLeader && (
      <label className="flex items-center gap-2 text-text-muted text-xs">
        <input
          type="checkbox"
          checked={member.sameAsPoc}
          onChange={(e) => onChange("sameAsPoc", e.target.checked)}
          className="cursor-target w-5 h-5"
        />
        Same as Crew Leader
      </label>
    )}
  </div>
  <input
    type="text"
    value={member.institution}
    onChange={(e) => onChange("institution", e.target.value)}
    disabled={!isLeader && member.sameAsPoc}
    className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none disabled:bg-thermal-accent/60 disabled:text-bg-base/70 cursor-target"
  />
</div>

          <div>
            <label className="block text-text-muted text-sm mb-1">
              Identity Proof (PDF or PNG)
            </label>
            <label className="flex items-center justify-between w-full rounded-lg bg-bg-base border border-dashed border-white/20 px-4 py-3 cursor-pointer hover:border-thermal-accent transition-colors">
              <span className="text-text-muted text-sm truncate">
                {member.idProof ? member.idProof.name : "Click to upload file"}
              </span>
              <span className="text-thermal-accent text-sm flex-shrink-0 ml-3">
                {member.idProof ? "Change" : "Upload"}
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

          {canRemove && (
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
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-text-muted text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="cursor-target w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none disabled:bg-thermal-accent/60 disabled:text-bg-base/70"
      />
    </div>
  );
}