import { events } from "@/app/data/events";
import { notFound } from "next/navigation";
import CrewRegisterForm from "./CrewRegisterForm";

export default function HipHopRegisterPage() {
  const event = events.find((e) => e.slug === "hip-hop-dance");
  if (!event) notFound();

  return <CrewRegisterForm event={event} />;
}