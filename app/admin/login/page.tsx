"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const clubOptions = [
  { id: "geethi-vaadya", label: "Chaitanya Geethi x Vaadya" },
  { id: "udc", label: "United Dance Crew" },
  { id: "laasya", label: "Laasya" },
  { id: "main", label: "Main Admin (All Registrations)" },
];

export default function AdminLogin() {
  const router = useRouter();
  const [club, setClub] = useState(clubOptions[0].id);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ club, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Wrong password");
    }
  }

  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-6 text-center">
          Admin Login
        </h1>

        <div>
          <label className="block text-text-muted text-sm mb-1">Club</label>
          <select
            value={club}
            onChange={(e) => setClub(e.target.value)}
            className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary outline-none"
          >
            {clubOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-text-muted text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-bg-surface border border-white/10 px-4 py-2 text-text-primary focus:border-thermal-mid-hot outline-none"
          />
        </div>

        {error && <p className="text-thermal-mid text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full mt-4 px-8 py-3 rounded-full bg-thermal-mid-hot text-bg-base font-semibold hover:opacity-90 transition-opacity"
        >
          Log in
        </button>
      </form>
    </main>
  );
}