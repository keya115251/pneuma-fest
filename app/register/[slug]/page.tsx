import { events } from "@/app/data/events";
import { notFound } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { slug } = await params;
  const { category } = await searchParams;
  const event = events.find((e) => e.slug === slug);

  if (!event) notFound();

  return <RegisterForm event={event} category={category} />;
}