"use client";

import { useId } from "react";

export default function PhoneInput({
  label = "Phone Number",
  value,
  onChange,
  required = true,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="block text-text-muted text-sm mb-1">{label}</label>
      <input
        id={inputId}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]{10}"
        maxLength={10}
        value={value}
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
          onChange(digitsOnly);
        }}
        required={required}
        placeholder="10-digit mobile number"
        className="cursor-target w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
      />
      {value.length > 0 && value.length < 10 && (
        <p className="text-thermal-accent/80 text-xs mt-1">
          Enter all 10 digits
        </p>
      )}
    </div>
  );
}
