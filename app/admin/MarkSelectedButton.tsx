"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkSelectedButton({ id }: { id: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/mark-selected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        setError("Failed to update.");
        return;
      }

      router.refresh();
    } catch {
      setError("Failed to update.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={submitting}
        className="rounded-full bg-thermal-accent text-bg-base text-xs font-semibold px-3 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {submitting ? "Marking..." : "Mark as Selected"}
      </button>
      {error && <span className="text-thermal-accent text-xs">{error}</span>}
    </div>
  );
}
