import { events } from "@/app/data/events";
import { notFound } from "next/navigation";
import DanceRegisterForm from "./DanceRegisterForm";

export default function ClassicalRegisterPage() {
  const event = events.find((e) => e.slug === "classical-dance");
  if (!event) notFound();

  return <DanceRegisterForm event={event} />;
}