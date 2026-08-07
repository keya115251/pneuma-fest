"use client";

import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

export default function Carousel({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  function scrollNext() {
    const el = scrollRef.current;
    if (!el) return;

    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;

    if (isAtEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: 500, behavior: "smooth" });
    }
  }

  function scrollPrev() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -500, behavior: "smooth" });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (isHovering.current) return;
      scrollNext();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => (isHovering.current = true)}
      onMouseLeave={() => (isHovering.current = false)}
    >
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scrollbar-hide"
      >
        {children}
      </div>

<button
  onClick={(e) => {
    e.stopPropagation();
    scrollPrev();
  }}
  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface border border-white/10 items-center justify-center text-text-primary hover:border-thermal-accent transition-colors"
>
  <ChevronLeft size={18} />
</button>
<button
  onClick={(e) => {
    e.stopPropagation();
    scrollNext();
  }}
  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-bg-surface border border-white/10 items-center justify-center text-text-primary hover:border-thermal-accent transition-colors"
>
  <ChevronRight size={18} />
</button>
    </div>
  );
}