"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleClick() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin-logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loggingOut}
      className="text-text-muted text-sm hover:text-thermal-accent transition-colors disabled:opacity-60"
    >
      {loggingOut ? "Logging out..." : "Log out"}
    </button>
  );
}
