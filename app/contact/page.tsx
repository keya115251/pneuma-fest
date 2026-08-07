import Reveal from "@/app/components/Reveal";
import LineWaves from "@/app/components/LineWaves";

const contacts = [
  { name: "Prateek", role: "Overall Coordinator", phone: "+91 8341092826" },
  { name: "Keya", role: "Chaitanya Geethi", phone: "+91 9100753081" },
  { name: "John Stalin", role: "Vaadya", phone: "+91 7075092911" },
  { name: "Sudhamayee", role: "UDC", phone: "+91 9494093154" },
  { name: "Jahnavi", role: "Laasya", phone: "+91 9177832035" },
];

export default function ContactPage() {
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
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-4">
            CONTACT US
          </h1>
          <p className="text-text-muted mb-16">
            Reach out with any questions about Pneuma.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 mb-8">
            
            <p className="text-text-muted mt-2">
              Instagram:{" "}
              
                <a href="https://instagram.com/dyuthi.cbit"
                className="text-thermal-accent hover:underline"
              >
                @pneuma
              </a>
            </p>
          </div>
        </Reveal>

        <div className="space-y-4">
          {contacts.map((contact, i) => (
            <Reveal key={i} delay={0.15 + i * 0.05}>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-bg-surface px-6 py-4">
                <div>
                  <p className="text-text-primary font-medium">
                    {contact.name}
                  </p>
                  <p className="text-text-muted text-sm">{contact.role}</p>
                </div>
                <span className="text-text-muted text-sm">
                  {contact.phone}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}