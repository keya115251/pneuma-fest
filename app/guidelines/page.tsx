import Reveal from "@/app/components/Reveal";
import MagicRings from "@/app/components/MagicRings";

const sections = [
  {
    title: "General Rules",
    points: [
      "Open to all colleges and schools nationwide.",
      "Participants must carry a valid, original college/school ID card at all times during the fest for verification. No entry without ID.",
      "Registration closes on [DATE] — no on-spot registrations will be entertained for competitions.",
      "Only one entry per category is allowed from each institution unless otherwise specified for a competition.",
      "Each participating team/contingent should ideally have one point of contact responsible for coordination with organizers.",
      "The organizing committee reserves the right to alter the schedule, venue, or format of any event due to unavoidable circumstances, with prior notice where possible.",
      "Decisions made by the judges and organizing committee are final and binding. No correspondence will be entertained after results are announced.",
      "Any objection regarding rule violations must be raised in writing to the organizing committee before the announcement of results.",
      "Participants are responsible for their own belongings. The organizers are not liable for loss of personal property.",
      "Entry to the venue may be restricted or denied at the discretion of organizers in case of overcrowding or safety concerns.",
    ],
  },
  {
    title: "Code of Conduct",
    points: [
      "All participants and attendees are expected to conduct themselves with courtesy, honesty, and respect toward fellow participants, organizers, judges, and staff at all times.",
      "Any act of ragging, in any form, is strictly prohibited and punishable under the UGC Regulations on Curbing the Menace of Ragging and applicable state anti-ragging acts. Offenders will be handed over to college authorities and may face legal action.",
      "Harassment, discrimination, or offensive conduct based on gender, caste, religion, disability, region, or nationality will not be tolerated and will result in immediate disqualification.",
      "Consumption or possession of alcohol, tobacco, or any banned substances on campus is strictly prohibited. Violators will be removed from the venue and may face disciplinary/legal action.",
      "Use of firearms, fireworks, open flames, or any hazardous material on stage or within the venue is strictly prohibited.",
      "Any act of physical violence, intimidation, or property damage will lead to immediate disqualification and may invite further disciplinary or legal action from the institute.",
      "Participants must adhere to decent and appropriate dressing for a public, mixed-audience event. Costumes for performances should stay within the bounds of decency.",
      "Photography and videography may be conducted by the organizing team for promotional and archival purposes. By participating, attendees consent to being featured in such media.",
      "Any damage caused to college property by a participant or their institution's contingent will be billed to the respective institution.",
      "The organizing committee reserves the right to disqualify or remove any participant/team found violating these guidelines, without prior notice.",
    ],
  },
];

export default function GuidelinesPage() {
  return (
        <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <MagicRings
          color="#A855F7"
          colorTwo="#F76707"
          ringCount={6}
          speed={0.6}
          attenuation={12}
          lineThickness={1.5}
          baseRadius={0.3}
          radiusStep={0.08}
          opacity={0.6}
          blur={2}
          noiseAmount={0.05}
          followMouse={true}
          mouseInfluence={0.15}
          parallax={0.03}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <Reveal>
          <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-4">
            GUIDELINES
          </h1>
          <p className="text-text-muted mb-16">
            General rules and code of conduct for all attendees and
            participants at Dyuthi. Competition-specific rules are listed on
            each event&apos;s page.
          </p>
        </Reveal>

        <div className="space-y-14">
          {sections.map((section, i) => (
            <Reveal key={section.title} delay={i * 0.1}>
              <div>
                <h2 className="text-2xl font-semibold text-thermal-accent mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.points.map((point, j) => (
                    <li
                      key={j}
                      className="text-text-muted leading-relaxed flex gap-3"
                    >
                      <span className="text-thermal-accent flex-shrink-0">
                        —
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}