import { events } from "@/app/data/events";
import { notFound } from "next/navigation";
import Round2Form from "./Round2Form";

export default function Round2Page() {
  const event = events.find((e) => e.slug === "battle-of-the-bands");
  if (!event) notFound();

  if (!event.round2Open) {
    return (
      <main className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-4xl text-text-primary mb-4">
            Round 2 Not Open Yet
          </h1>
          <p className="text-text-muted">
            Round 2 registration opens once Round 1 selections are
            announced on our Instagram page.
          </p>
        </div>
      </main>
    );
  }

  return <Round2Form />;
}