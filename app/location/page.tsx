import Reveal from "@/app/components/Reveal";
import LineWaves from "@/app/components/LineWaves";

export default function LocationPage() {
  return (
    <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20 overflow-hidden">
  <div className="absolute inset-0 z-0 opacity-20">
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
  <div className="relative z-10 max-w-3xl mx-auto">
        <Reveal>
          <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-4">
            LOCATION
          </h1>
          <p className="text-text-muted mb-16">Find your way to Pneuma.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Venue
            </h2>
            <p className="text-text-muted leading-relaxed">
              Chaitanya Bharathi Institute of Technology (CBIT)
              <br />
              Osman Sagar Road, Kokapet, Gandipet, Hyderabad, Telangana — 500075
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="rounded-2xl border border-white/10 bg-bg-surface overflow-hidden mb-8">
            <iframe
              src="https://www.google.com/maps?q=Chaitanya+Bharathi+Institute+of+Technology+Hyderabad&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <h2 className="text-2xl font-semibold text-thermal-accent mb-6">
            Getting There
          </h2>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-bg-surface p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                By Air
              </h3>
              <p className="text-text-muted leading-relaxed">
                Rajiv Gandhi International Airport (Shamshabad) is the
                nearest airport, about 13–15 km from campus. Cabs and
                app-based rides take roughly 25–30 minutes depending on
                traffic.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-bg-surface p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                By Train
              </h3>
              <p className="text-text-muted leading-relaxed">
                Hyderabad Deccan (Nampally) and Secunderabad Railway
                Stations are the most convenient stations, each about
                20–25 km away. From either station, a cab or auto to
                campus takes approximately 45 minutes to an hour
                depending on traffic.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-bg-surface p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                By Bus
              </h3>
              <p className="text-text-muted leading-relaxed">
                TSRTC city buses (including routes 505 and 220J) connect
                to the CBIT bus stop, right outside campus. From
                Mehdipatnam, buses like the 5M run directly to CBIT. If
                arriving at Mehdipatnam Bus Station from other parts of
                the city, it&apos;s an easy last-mile connection from
                there.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-bg-surface p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                By Road / Cab
              </h3>
              <p className="text-text-muted leading-relaxed">
                CBIT is located on Osman Sagar Road in Gandipet, close to
                the Financial District. App-based cabs and autos are
                readily available from most parts of Hyderabad. If
                driving, on-campus parking will be available for
                participants and attendees — details closer to the
                event.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}