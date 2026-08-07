"use client";

const sponsorsRow1 = ["Sponsor One", "Sponsor Two", "Sponsor Three", "Sponsor Four"];
const sponsorsRow2 = ["Sponsor Five", "Sponsor Six", "Sponsor Seven", "Sponsor Eight"];

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  // repeat the list several times so there's always enough width to loop seamlessly
  const looped = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden w-full">
      <div
        className={`flex gap-6 w-max ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {looped.map((sponsor, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-32 md:w-auto rounded-xl border border-dashed border-white/20 bg-bg-surface px-6 py-6 md:px-16 md:py-12 text-text-primary text-sm md:text-2xl font-medium truncate md:overflow-visible md:text-clip md:whitespace-nowrap"
          >
            {sponsor}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SponsorMarquee() {
  return (
    <div className="space-y-10">
      <MarqueeRow items={sponsorsRow1} />
      <MarqueeRow items={sponsorsRow2} reverse />
    </div>
  );
}