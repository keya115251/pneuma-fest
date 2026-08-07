import Reveal from "@/app/components/Reveal";
import LineWaves from "@/app/components/LineWaves";

const amenities = [
  {
    title: "Accommodation",
    description:
      "Details on outstation participant accommodation will be listed here — hostel availability, booking process, cost.",
  },
  {
    title: "Food & Refreshments",
    description:
      "Information on meal arrangements, food stalls, and dietary options during the fest.",
  },
  {
    title: "First Aid & Medical",
    description:
      "On-campus medical support details and emergency contact information.",
  },
  {
    title: "Instrument & Equipment Access",
    description:
      "What's provided on-stage (amps, drum kits, sound systems) versus what participants need to bring themselves.",
  },
];

export default function AmenitiesPage() {
  return (
    <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20 overflow-hidden">
  <div className="absolute inset-0 opacity-20">
    <LineWaves
      speed={0.3}
      innerLineCount={32}
      outerLineCount={36}
      warpIntensity={1.0}
      rotation={-45}
      edgeFadeWidth={0.0}
      colorCycleSpeed={1.0}
      brightness={0.3}
      color1="#3b0090"
      color2="#ffffff"
      color3="#c40b8d"
      enableMouseInteraction={true}
      mouseInfluence={2.0}
    />
  </div>
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-4">
            AMENITIES
          </h1>
          <p className="text-text-muted mb-16">
            Everything you need to know for a comfortable stay at Pneuma.
          </p>
        </Reveal>

        <div className="space-y-6">
          {amenities.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <div className="rounded-2xl border border-white/10 bg-bg-surface p-8">
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  {item.title}
                </h2>
                <p className="text-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}