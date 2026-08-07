"use client";

import { useState } from "react";
import TransitionLink from "@/app/components/TransitionLink";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/#calendar" },
  { label: "Sponsors", href: "/#sponsors" },
  { label: "Guidelines", href: "/guidelines" },
];

const visitLinks = [
  { label: "Amenities", href: "/amenities" },
  { label: "Location", href: "/location" },
  { label: "Contact", href: "/contact" },
];

const registerLinks = [
  { label: "As Participant", href: "/events" },
  { label: "As Audience", href: "/register/audience" },
];

export default function NavBar() {
  const [visitOpen, setVisitOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-2 bg-bg-base/70 backdrop-blur-md border-b border-white/10">
      <TransitionLink href="/">
        <img src="/dyuthi-logo.png" alt="Dyuthi" className="cursor-target h-14 w-auto invert" />
      </TransitionLink>

      <div className="font-heading hidden md:flex items-center gap-8 text-2xl tracking-wide">
        {navLinks.map((link) => (
          <TransitionLink
            key={link.label}
            href={link.href}
            className="cursor-target text-text-muted hover:text-thermal-accent hover:[text-shadow:0_0_8px_var(--color-thermal-accent)] transition-colors duration-200"
          >
            {link.label}
          </TransitionLink>
        ))}

        <div
          className="relative"
          onMouseEnter={() => setVisitOpen(true)}
          onMouseLeave={() => setVisitOpen(false)}
        >
          <button className="cursor-target text-text-muted hover:text-thermal-accent hover:[text-shadow:0_0_8px_var(--color-thermal-accent)] transition-colors duration-200">
            Visit
          </button>

          <AnimatePresence>
            {visitOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-3 w-40 rounded-xl border border-white/10 bg-bg-surface overflow-hidden"
              >
                {visitLinks.map((link) => (
                  <TransitionLink
                    key={link.label}
                    href={link.href}
                    className="cursor-target block px-4 py-3 text-lg  text-text-muted hover:text-thermal-accent hover:[text-shadow:0_0_8px_var(--color-thermal-accent)] hover:bg-white/5 transition-colors duration-200"
                  >
                    {link.label}
                  </TransitionLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setRegisterOpen(true)}
          onMouseLeave={() => setRegisterOpen(false)}
        >
          <button className="cursor-target text-text-muted hover:text-thermal-accent hover:[text-shadow:0_0_8px_var(--color-thermal-accent)] transition-colors duration-200">
            Register
          </button>

          <AnimatePresence>
            {registerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-3 w-48 rounded-xl border border-white/10 bg-bg-surface overflow-hidden"
              >
                {registerLinks.map((link) => (
                  <TransitionLink
                    key={link.label}
                    href={link.href}
                    className="cursor-target block px-4 py-3 text-lg  text-text-muted hover:text-thermal-accent hover:[text-shadow:0_0_8px_var(--color-thermal-accent)] hover:bg-white/5 transition-colors duration-200"
                  >
                    {link.label}
                  </TransitionLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex md:hidden gap-4 text-sm">
        <TransitionLink href="/events" className="cursor-target text-text-muted">
          Events
        </TransitionLink>
      </div>
    </nav>
  );
}