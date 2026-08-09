import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ClubId } from "@/app/lib/clubAuth";
import { supabaseAdmin } from "@/app/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const clubId = cookieStore.get("admin_club")?.value as ClubId | undefined;

  if (clubId !== "geethi-vaadya") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("band_registrations")
    .update({ status: "selected" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
