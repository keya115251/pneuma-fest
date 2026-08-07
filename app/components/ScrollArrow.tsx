"use client";

import { motion } from "framer-motion";

export default function ScrollArrow({
  targetId,
  direction = "down",
}: {
  targetId: string;
  direction?: "up" | "down";
}) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 1 }}
      transition={{ duration: 0.4 }}
      className={`absolute ${
        direction === "down" ? "bottom-10" : "top-24"
      } left-1/2 -translate-x-1/2 z-10 text-text-muted hover:text-thermal-accent transition-colors`}
    >
      <motion.div
        animate={{ y: direction === "down" ? [0, 10, 0] : [0, -10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {direction === "down" ? (
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </motion.div>
    </motion.button>
  );
}