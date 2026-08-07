import { events } from "@/app/data/events";
import { notFound } from "next/navigation";
import BandRegisterForm from "./BandRegisterForm";

export default function BandRegisterPage() {
  const event = events.find((e) => e.slug === "battle-of-the-bands");
  if (!event) notFound();

  if (event.round2Open) {
    return (
      <main className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-4xl text-text-primary mb-4">
            Round 1 Registrations Closed
          </h1>
          <p className="text-text-muted">
            Round 1 for Battle of the Bands has closed. Selected bands can
            proceed to Round 2 registration.
          </p>
        </div>
      </main>
    );
  }

  return <BandRegisterForm />;
}