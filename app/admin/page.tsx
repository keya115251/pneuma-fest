import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clubs, ClubId } from "@/app/lib/clubAuth";
import { supabaseAdmin } from "@/app/lib/supabase/admin";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const clubId = cookieStore.get("admin_club")?.value as ClubId | undefined;

  if (!clubId || !(clubId in clubs)) {
    redirect("/admin/login");
  }

  const clubConfig = clubs[clubId];

  const { data: registrations, error } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .in("event_slug", clubConfig.eventSlugs)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-bg-base px-6 pt-32 pb-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-1">
          {clubConfig.label} — Registrations
        </h1>
        <p className="text-text-muted mb-8">
          {registrations?.length ?? 0} total
        </p>

        {error && (
          <p className="text-thermal-mid">Error loading registrations.</p>
        )}

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-surface text-text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Members</th>
              </tr>
            </thead>
            <tbody className="text-text-primary">
              {registrations?.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{r.phone}</td>
                  <td className="px-4 py-3">{r.college}</td>
                  <td className="px-4 py-3">{r.category ?? "—"}</td>
                  <td className="px-4 py-3">{r.team_name ?? "—"}</td>
                  <td className="px-4 py-3">{r.team_members ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}