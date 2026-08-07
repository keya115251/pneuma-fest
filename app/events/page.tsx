"use client";

import { useRouter } from "next/navigation";
import { events } from "@/app/data/events";
import Reveal from "@/app/components/Reveal";
import CardSwap, { Card } from "@/app/components/CardSwap";
import { useNavigationLoading } from "@/app/components/NavigationProvider";
import Waves from "@/app/components/Waves";

const workshops = [
  {
    id: "workshop-1",
    title: "Workshop / Celebrity Session",
    host: "Chaitanya Geethi x Vaadya",
    day: "Day 1",
    image: "/workshops/geethi-vaadya.jpg",
  },
  {
    id: "workshop-2",
    title: "Workshop / Celebrity Session",
    host: "UDC",
    day: "Day 2",
    image: "/workshops/udc.jpg",
  },
  {
    id: "workshop-3",
    title: "Workshop / Celebrity Session",
    host: "Chaitanya Laasya",
    day: "Day 2",
    image: "/workshops/laasya.jpg",
  },
];

function TitleBar({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-white/10 bg-black/40">
      <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
      <span className="text-sm text-text-primary/90 font-medium">{label}</span>
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();

  return (
    <main className="h-screen overflow-hidden bg-bg-base pt-10 px-6">
      <div className="pointer-events-none">
  <Waves
      lineColor="rgba(255,255,255,0.1
      )"
      backgroundColor="transparent"
      waveSpeedX={0.015}
      waveSpeedY={0.008}
      waveAmpX={30}
      waveAmpY={15}
      friction={0.9}
      tension={0.008}
      maxCursorMove={100}
      xGap={14}
      yGap={34}
    />
  </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-4 h-[calc(100vh-4rem)] overflow-hidden">
        {/* COMPETITIONS - fans left, anchored near center boundary (default right:0 of this column) */}
        <section className="relative z-10 flex flex-col justify-center">
          <Reveal>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-2 text-center">
              COMPETITIONS
            </h2>
            <p className="text-text-muted mb-6 text-center">
              Three flagship competitions, one national stage.
            </p>
          </Reveal>
          <p className="text-text-muted mb-6 text-center"></p>

          <div style={{ height: "550px", position: "relative" }}>
            <CardSwap
              direction="left"
              skewAmount={-6}
              cardDistance={90}
              verticalDistance={100}
              delay={4000}
              pauseOnHover={true}
              width={760}
              height={560}
              onCardClick={(i, isFront) => {
        if (isFront) {
          startLoading();
          router.push(`/events/${events[i].slug}`);
        }
      }}
    >
              {events.map(event => (
                <Card key={event.slug} className="overflow-hidden">
                  <div className="block w-full h-full group cursor-pointer">
                    <TitleBar label={event.title} />
                    <div className="relative w-full h-[calc(100%-45px)]">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${event.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="relative z-10 h-full flex flex-col items-end justify-end p-6 text-right">
                        <h3 className="font-heading text-xl md:text-2xl text-text-primary">
                        {event.title}
                      </h3>
                        <p className="text-text-muted">{event.name}</p>
                        <p className="text-text-muted text-sm">{event.hosts}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </div>
        </section>

        {/* WORKSHOPS - fans right, anchored near center boundary (left:0 of this column) */}
        <section id="workshops" className="relative z-10 flex flex-col justify-center">
          <Reveal>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-2 text-center">
              WORKSHOPS
            </h2>
            <p className="text-text-muted mb-6 text-center">
              Running alongside the competitions on both days.
            </p>
          </Reveal>
          <p className="text-text-muted mb-6 text-center"></p>
          <div style={{ height: "550px", position: "relative" }}>
            <CardSwap
              className="anchor-left"
              cardDistance={90}
              verticalDistance={100}
              delay={4000}
              pauseOnHover={true}
              width={760}
              height={560}
            >
              {workshops.map(workshop => (
                <Card key={workshop.id} className="overflow-hidden">
                  <TitleBar label={workshop.title} />
                  <div className="relative w-full h-[calc(100%-45px)]">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${workshop.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <h3 className="font-heading text-xl md:text-2xl text-text-primary">
                        {workshop.title}
                      </h3>
                      <p className="mt-2 text-text-muted">{workshop.host}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </div>
        </section>
      </div>
    </main>
  );
}