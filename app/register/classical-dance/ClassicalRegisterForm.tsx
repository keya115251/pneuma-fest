"use client";

import { useId, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import type { FestEvent } from "@/app/data/events";
import Waves from "@/app/components/Waves";

export default function ClassicalRegisterForm({
  event,
  category,
}: {
  event: FestEvent;
  category?: string;
}) {
  const isGroup = category === "group";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    teamName: "",
    teamMembers: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const teamMembersId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    const { error } = await supabase.from("registrations").insert({
      event_slug: event.slug,
      category: category ?? null,
      team_name: isGroup ? form.teamName : null,
      name: form.name,
      email: form.email,
      phone: form.phone,
      college: form.college,
      team_members: isGroup ? form.teamMembers : null,
    });

    setStatus(error ? "error" : "done");
  }

  if (status === "done") {
    return (
      <main className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-text-primary mb-2">
            You&apos;re registered!
          </h1>
          <p className="text-text-muted">
            {event.name} {category ? `— ${category}` : ""}
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

      <div className="relative z-10 max-w-md mx-auto">
        <h1 className="font-heading text-3xl text-text-primary mb-1">
          Register — {event.name}
        </h1>
        {category && (
          <p className="text-text-muted mb-8 capitalize">{category}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <Input
            label={isGroup ? "Team Leader Name" : "Name"}
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            required
          />
          <Input
            label="College / School"
            value={form.college}
            onChange={(v) => setForm({ ...form, college: v })}
            required
          />

          {isGroup && (
            <>
              <Input
                label="Team Name"
                value={form.teamName}
                onChange={(v) => setForm({ ...form, teamName: v })}
                required
              />
              <div>
                <label htmlFor={teamMembersId} className="block text-text-muted text-sm mb-1">
                  Team Members (names, comma separated)
                </label>
                <textarea
                  id={teamMembersId}
                  value={form.teamMembers}
                  onChange={(e) =>
                    setForm({ ...form, teamMembers: e.target.value })
                  }
                  required
                  rows={3}
                  className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full mt-6 px-8 py-3 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity disabled:bg-thermal-accent/60 disabled:text-bg-base/70"
          >
            {status === "submitting" ? "Submitting..." : "Submit"}
          </button>

          {status === "error" && (
            <p className="text-thermal-accent text-sm">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="block text-text-muted text-sm mb-1">{label}</label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-accent outline-none"
      />
    </div>
  );
}