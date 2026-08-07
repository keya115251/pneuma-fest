"use client";

import Link from "next/link";

export default function StickyRegisterBar({
  eventName,
  registerHref,
  registerLabel = "Register",
  secondaryHref,
  secondaryLabel,
}: {
  eventName: string;
  registerHref: string;
  registerLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-bg-base/90 backdrop-blur-md px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <p className="text-text-primary font-medium truncate">{eventName}</p>
        <div className="flex gap-3 flex-shrink-0">
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="cursor-target px-6 py-2 rounded-full border border-thermal-accent text-thermal-accent font-semibold hover:bg-thermal-accent hover:text-bg-base transition-colors text-sm"
            >
              {secondaryLabel}
            </Link>
          )}
          <Link
            href={registerHref}
            className="cursor-target px-6 py-2 rounded-full bg-thermal-accent text-bg-base font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            {registerLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}