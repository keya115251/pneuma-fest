import Reveal from "@/app/components/Reveal";
import LineWaves from "@/app/components/LineWaves";

export default function LocationPage() {
  return (
    <main className="relative min-h-screen bg-bg-base px-6 pt-32 pb-20 overflow-hidden">
  <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
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
          <p className="text-text-muted mb-16">
            Everything you need to find your way to Dyuthi.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Venue
            </h2>
            <p className="text-text-muted leading-relaxed">
              Chaitanya Bharathi Institute of Technology (CBIT)
              <br />
              Osman Sagar Road, Kokapet, Gandipet, Hyderabad, Telangana, 500075
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
                Rajiv Gandhi International Airport (Shamshabad) is about
                30 km from campus. Thanks to the Outer Ring Road, cabs
                and app-based rides typically take 30 to 40 minutes.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-bg-surface p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                By Train
              </h3>
              <p className="text-text-muted leading-relaxed">
                Secunderabad Railway Station is about 30 km away, and
                Hyderabad Deccan (Nampally) is about 20 to 25 km away.
                From either, expect 1 to 1.5 hours by cab or auto
                depending on traffic. Both stations sit right beside
                their own metro stops, Secunderabad East/West and
                Nampally, so hopping onto the Hyderabad Metro toward
                Lakdikapul or Mehdipatnam can be a faster, more
                predictable alternative during peak hours.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-bg-surface p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                By Bus
              </h3>
              <p className="text-text-muted leading-relaxed">
                TSRTC city buses, including routes 505 and 220J, stop
                right outside campus at the CBIT bus stop. From
                Mehdipatnam, the 5M runs directly to CBIT, and it&apos;s
                an easy last-mile connection if you&apos;re arriving at
                Mehdipatnam Bus Station from elsewhere in the city.
                Lakdikapul is the nearest metro station to
                Mehdipatnam, about a 15 minute walk, making it a
                convenient interchange point if you&apos;re coming from
                elsewhere on the metro network.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-bg-surface p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                By Road / Cab
              </h3>
              <p className="text-text-muted leading-relaxed">
                CBIT sits on Osman Sagar Road in Gandipet, close to the
                Financial District, with app-based cabs and autos
                available from most parts of Hyderabad. If you&apos;re
                driving, on-campus parking will be available for
                participants and attendees, with details shared closer
                to the event.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}