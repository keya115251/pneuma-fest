"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import PhoneInput from "@/app/components/PhoneInput";
import Waves from "@/app/components/Waves"

const AUDIENCE_PRICE = 100;

export default function AudienceRegisterForm() {
  const [step, setStep] = useState<"details" | "payment" | "done">("details");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [institution, setInstitution] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canProceedToPayment =
    name.trim() !== "" &&
    age.trim() !== "" &&
    institution.trim() !== "" &&
    phone.length === 10 &&
    email.trim() !== "";

  async function handleSubmit() {
    if (!paymentScreenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data: registration, error: regError } = await supabase
        .from("audience_registrations")
        .insert({
          name,
          age: parseInt(age),
          institution,
          phone,
          email,
          amount_paid: AUDIENCE_PRICE,
        })
        .select()
        .single();

      if (regError || !registration) throw regError;

      const paymentPath = `${registration.id}/payment-screenshot-${paymentScreenshot.name}`;
      const { error: uploadError } = await supabase.storage
        .from("registration-uploads")
        .upload(paymentPath, paymentScreenshot);

      if (uploadError) throw uploadError;

      await supabase
        .from("audience_registrations")
        .update({ payment_screenshot_url: paymentPath })
        .eq("id", registration.id);

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
          <p className="text-text-muted">Audience pass — {name}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20 overflow-hidden">
      <div className="pointer-events-none">
  <Waves
      lineColor="rgba(255,255,255,0.1
      )"
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
          Register — Audience
        </h1>
        <p className="text-text-muted mb-10">
          {step === "details" && "Your details"}
          {step === "payment" && "Payment"}
        </p>

        {step === "details" && (
          <>
            <div className="space-y-4 mb-8">
              <Input label="Name" value={name} onChange={setName} />
              <Input
                label="Age"
                type="number"
                value={age}
                onChange={setAge}
              />
              <Input
                label="Institution"
                value={institution}
                onChange={setInstitution}
              />
              <PhoneInput value={phone} onChange={setPhone} />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
              />
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
                Total Amount
              </p>
              <p className="text-text-primary text-3xl font-semibold">
                ₹{AUDIENCE_PRICE}
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

            {error && (
              <p className="text-thermal-accent text-sm mb-4">{error}</p>
            )}

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
        required
        className="cursor-target w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
      />
    </div>
  );
}
