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
            className="flex-shrink-0 rounded-xl border border-dashed border-white/20 bg-bg-surface px-16 py-12 text-text-primary text-2xl font-medium whitespace-nowrap"
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