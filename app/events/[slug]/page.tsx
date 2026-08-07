import { notFound } from "next/navigation";
import { events } from "@/app/data/events";
import EventDetails from "./EventDetails";
import CategoryToggle from "./CategoryToggle";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);

  if (!event) notFound();

  if (event.format === "band-only" || event.format === "single") {
    return <EventDetails event={event} />;
  }

  return <CategoryToggle event={event} />;
}